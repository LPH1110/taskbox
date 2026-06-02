import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
  updateWorkspaceMemberSchema,
  removeWorkspaceMemberSchema,
  createWorkspaceInvitationSchema,
  cancelWorkspaceInvitationSchema,
} from "./workspaces.schema";
import { requireAuth, requireWorkspaceMember, requireWorkspaceAdmin } from "../../middleware/auth";
import { logActivity } from "../../utils/activity-logger";
import { sendInvitationEmail, sendRemovalEmail } from "../../utils/mailer";


const router = Router();

// Protect all workspace routes
router.use(requireAuth);

// GET /api/workspaces (Fetch user's workspaces)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      orderBy: { created_at: "desc" },
    });

    return sendSuccess(res, workspaces);
  } catch (error) {
    return next(error);
  }
});

// POST /api/workspaces (Create Workspace)
router.post("/", validate(createWorkspaceSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { name, description, logoUrl } = req.body;

  try {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        logo_url: logoUrl,
        owner_id: userId,
      },
    });

    return sendSuccess(res, workspace, 201);
  } catch (error) {
    return next(error);
  }
});

// GET /api/workspaces/:id (Get Workspace Detail + Board count)
router.get("/:id", validate(workspaceIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        OR: [
          { owner_id: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      include: {
        _count: {
          select: { boards: true },
        },
      },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    return sendSuccess(res, workspace);
  } catch (error) {
    return next(error);
  }
});


// PATCH /api/workspaces/:id (Update Workspace)
router.patch("/:id", validate(updateWorkspaceSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;
  const { name, description, logoUrl } = req.body;

  try {
    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: { id, owner_id: userId },
    });

    if (!existing) {
      return sendError(res, "Workspace not found", 404);
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        name,
        description,
        logo_url: logoUrl,
      },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/workspaces/:id (Delete Workspace)
router.delete("/:id", validate(workspaceIdParamSchema), async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any).id;
  const { id } = req.params;

  try {
    const existing = await prisma.workspace.findFirst({
      where: { id, owner_id: userId },
    });

    if (!existing) {
      return sendError(res, "Workspace not found", 404);
    }

    await prisma.workspace.delete({
      where: { id },
    });

    return sendSuccess(res, { message: "Workspace deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

// GET /api/workspaces/:id/members (Fetch all members + owner)
router.get("/:id/members", requireWorkspaceMember, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
        members: {
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    // Adapt to standard format
    const ownerMember = {
      workspace_id: id,
      user_id: workspace.owner.id,
      role: "owner",
      joined_at: workspace.created_at,
      profiles: workspace.owner,
    };

    const adaptedMembers = workspace.members.map((m) => ({
      workspace_id: m.workspace_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      profiles: m.profile,
    }));

    return sendSuccess(res, [ownerMember, ...adaptedMembers]);
  } catch (error) {
    return next(error);
  }
});

// POST /api/workspaces/:id/invitations (Create Workspace Invitation)
router.post("/:id/invitations", requireWorkspaceAdmin, validate(createWorkspaceInvitationSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { email, role } = req.body;
  const actorId = (req.user as any).id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { name: true, owner_id: true },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    // Role restrictions: Admins can only invite users as "member"
    let finalRole = role;
    if (workspace.owner_id !== actorId && role === "admin") {
      finalRole = "member";
    }

    // Check if user with that email is already the owner
    const ownerProfile = await prisma.profile.findUnique({
      where: { email },
    });
    if (ownerProfile && workspace.owner_id === ownerProfile.id) {
      return sendError(res, "User is already the owner of this workspace.", 400);
    }

    // Check if user is already a member
    if (ownerProfile) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspace_id_user_id: {
            workspace_id: id,
            user_id: ownerProfile.id,
          },
        },
      });

      if (existingMember) {
        return sendError(res, "User is already a member of this workspace.", 400);
      }
    }

    // Check if there is already an active pending invitation
    const existingPending = await prisma.workspaceInvitation.findFirst({
      where: {
        workspace_id: id,
        email: email.toLowerCase(),
        status: "pending",
      },
    });

    if (existingPending) {
      const isExpired = new Date() > new Date(existingPending.expires_at);
      if (isExpired) {
        // Automatically mark as expired to keep DB state clean
        await prisma.workspaceInvitation.update({
          where: { id: existingPending.id },
          data: { status: "expired" },
        });
        return sendError(res, "A pending invitation for this email has expired. Please cancel it before creating a new one.", 400);
      }
      return sendError(res, "An invitation is already pending for this email address.", 400);
    }

    // Create the invitation
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspace_id: id,
        email: email.toLowerCase(),
        role: finalRole,
        invited_by: actorId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Fetch actor profile for mailer
    const actorProfile = await prisma.profile.findUnique({
      where: { id: actorId },
      select: { full_name: true, email: true },
    });

    // Send the email
    await sendInvitationEmail({
      to: email,
      workspaceName: workspace.name,
      inviterName: actorProfile?.full_name || actorProfile?.email || "Unknown User",
      role: finalRole,
      token: invitation.token,
    });

    // Log activity
    await logActivity({
      workspaceId: id,
      actorId,
      action: "invitation.sent",
      targetType: "invitation",
      targetId: invitation.id,
      metadata: {
        target_email: email,
        role: finalRole,
      },
    });

    return sendSuccess(res, invitation, 201);
  } catch (error) {
    return next(error);
  }
});

// GET /api/workspaces/:id/invitations (Get Workspace Invitations)
router.get("/:id/invitations", requireWorkspaceAdmin, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const invitations = await prisma.workspaceInvitation.findMany({
      where: { workspace_id: id },
      orderBy: { created_at: "desc" },
    });

    // Real-time check and update expired invitations
    const now = new Date();
    const updatedInvitations = await Promise.all(
      invitations.map(async (inv) => {
        if (inv.status === "pending" && now > new Date(inv.expires_at)) {
          const updated = await prisma.workspaceInvitation.update({
            where: { id: inv.id },
            data: { status: "expired" },
          });
          return updated;
        }
        return inv;
      })
    );

    return sendSuccess(res, updatedInvitations);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/workspaces/:id/invitations/:invitationId (Cancel Workspace Invitation)
router.delete("/:id/invitations/:invitationId", requireWorkspaceAdmin, validate(cancelWorkspaceInvitationSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { id, invitationId } = req.params;

  try {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.workspace_id !== id) {
      return sendError(res, "Invitation not found", 404);
    }

    if (invitation.status !== "pending" && invitation.status !== "expired") {
      return sendError(res, `Cannot cancel an invitation that is already ${invitation.status}`, 400);
    }

    // Cancel the invitation
    const cancelledInvitation = await prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: "cancelled" },
    });

    // Log activity
    await logActivity({
      workspaceId: id,
      actorId: (req.user as any).id,
      action: "invitation.cancelled",
      targetType: "invitation",
      targetId: invitationId,
      metadata: {
        target_email: invitation.email,
        role: invitation.role,
      },
    });

    return sendSuccess(res, cancelledInvitation);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/workspaces/:id/members/:userId (Promote/Demote Workspace Member role)
router.patch("/:id/members/:userId", requireWorkspaceAdmin, validate(updateWorkspaceMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { id, userId } = req.params;
  const { role } = req.body;
  const actorId = (req.user as any).id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { owner_id: true },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    // Role restrictions: Only the owner can promote/demote admin roles
    if (workspace.owner_id !== actorId) {
      return sendError(res, "Forbidden: Only the workspace owner can manage admin roles", 403);
    }

    if (workspace.owner_id === userId) {
      return sendError(res, "Cannot change the role of the workspace owner.", 400);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: id,
          user_id: userId,
        },
      },
      include: {
        profile: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!membership) {
      return sendError(res, "Member not found in workspace", 404);
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspace_id_user_id: {
          workspace_id: id,
          user_id: userId,
        },
      },
      data: { role },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    const adaptedMember = {
      workspace_id: updated.workspace_id,
      user_id: updated.user_id,
      role: updated.role,
      joined_at: updated.joined_at,
      profiles: updated.profile,
    };

    // Log activity
    await logActivity({
      workspaceId: id,
      actorId,
      action: "member.role_changed",
      targetType: "member",
      targetId: userId,
      metadata: {
        target_name: membership.profile.full_name,
        target_email: membership.profile.email,
        role,
      },
    });

    return sendSuccess(res, adaptedMember);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/workspaces/:id/members/:userId (Remove Workspace Member or self-leave)
router.delete("/:id/members/:userId", requireWorkspaceMember, validate(removeWorkspaceMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { id, userId } = req.params;
  const actorId = (req.user as any).id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { owner_id: true, name: true },
    });

    if (!workspace) {
      return sendError(res, "Workspace not found", 404);
    }

    if (workspace.owner_id === userId) {
      return sendError(res, "Cannot remove the workspace owner.", 400);
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: id,
          user_id: userId,
        },
      },
      include: {
        profile: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!targetMembership) {
      return sendError(res, "Member not found in workspace", 404);
    }

    // Role restrictions for removal:
    // 1. A user can always remove themselves (self-leave)
    // 2. The owner can remove anyone (admin or member)
    // 3. An admin can remove a member, but NOT another admin
    const isSelfRemove = actorId === userId;
    const isOwnerRemove = actorId === workspace.owner_id;

    if (!isSelfRemove && !isOwnerRemove) {
      // Must be admin to remove someone else
      const actorMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspace_id_user_id: {
            workspace_id: id,
            user_id: actorId,
          },
        },
      });

      if (!actorMembership || actorMembership.role !== "admin") {
        return sendError(res, "Forbidden: Unauthorized to remove workspace member", 403);
      }

      // Admin cannot remove another admin
      if (targetMembership.role === "admin") {
        return sendError(res, "Forbidden: Workspace admins can only be removed by the owner", 403);
      }
    }

    // Cascade BoardMember cleanup: remove user from all boards within this workspace
    const workspaceBoards = await prisma.board.findMany({
      where: { workspace_id: id },
      select: { id: true },
    });
    const boardIds = workspaceBoards.map((b) => b.id);

    if (boardIds.length > 0) {
      await prisma.boardMember.deleteMany({
        where: {
          board_id: { in: boardIds },
          user_id: userId,
        },
      });
    }

    // Delete the workspace membership
    await prisma.workspaceMember.delete({
      where: {
        workspace_id_user_id: {
          workspace_id: id,
          user_id: userId,
        },
      },
    });

    // Send removal email if they were removed by someone else
    if (!isSelfRemove) {
      const actorProfile = await prisma.profile.findUnique({
        where: { id: actorId },
        select: { full_name: true, email: true },
      });
      const removerName = actorProfile?.full_name || actorProfile?.email || "Workspace Admin";
      
      sendRemovalEmail({
        to: targetMembership.profile.email,
        workspaceName: workspace.name,
        removerName,
      }).catch(err => console.error("Failed to send removal email asynchronously:", err));
    }

    // Log activity
    await logActivity({
      workspaceId: id,
      actorId,
      action: isSelfRemove ? "member.left" : "member.removed",
      targetType: "member",
      targetId: userId,
      metadata: {
        target_name: targetMembership.profile.full_name,
        target_email: targetMembership.profile.email,
      },
    });

    return sendSuccess(res, userId);
  } catch (error) {
    return next(error);
  }
});

// GET /api/workspaces/:id/activity (Paginated activity logs)
router.get("/:id/activity", requireWorkspaceMember, async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const skip = (page - 1) * limit;

  try {
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { workspace_id: id },
        orderBy: { created_at: "desc" },
        take: limit,
        skip,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.activityLog.count({
        where: { workspace_id: id },
      }),
    ]);

    const hasMore = skip + activities.length < total;

    return sendSuccess(res, {
      activities,
      hasMore,
      total,
      page,
      limit,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

