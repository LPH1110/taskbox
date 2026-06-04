import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { requireAuth } from "../../middleware/auth";
import { logActivity } from "../../utils/activity-logger";

const router = Router();

// GET /api/invitations/:token (Public - Get invitation details)
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  try {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: { name: true },
        },
        inviter: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    const isExpired = new Date() > new Date(invitation.expires_at);
    if (invitation.status === "pending" && isExpired) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      invitation.status = "expired";
    }

    if (invitation.status !== "pending") {
      return sendError(res, `This invitation is no longer valid (status: ${invitation.status})`, 400);
    }

    return sendSuccess(res, {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      workspaceName: invitation.workspace.name,
      inviterName: invitation.inviter.full_name || invitation.inviter.email,
    });
  } catch (error) {
    return next(error);
  }
});

// Mount requireAuth for actions
router.use(requireAuth);

// POST /api/invitations/:token/accept (Auth - Accept invitation)
router.post("/:token/accept", async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const userId = (req.user as any).id;
  const userEmail = (req.user as any).email;

  try {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: { name: true, owner_id: true },
        },
        inviter: {
          select: { full_name: true },
        },
      },
    });

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    const isExpired = new Date() > new Date(invitation.expires_at);
    if (invitation.status === "pending" && isExpired) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return sendError(res, "This invitation has expired", 400);
    }

    if (invitation.status !== "pending") {
      return sendError(res, `This invitation is no longer valid (status: ${invitation.status})`, 400);
    }

    // Verify logged-in user matches invitation email
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      return sendError(res, "You can only accept invitations sent to your email address", 403);
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: invitation.workspace_id,
          user_id: userId,
        },
      },
    });

    if (existingMember) {
      // Mark invitation as accepted if they are already in the workspace
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      });
      return sendSuccess(res, { message: "Already a member of this workspace" });
    }

    // Perform database transaction to add member and update invitation
    await prisma.$transaction(async (tx: any) => {
      // 1. Add member
      await tx.workspaceMember.create({
        data: {
          workspace_id: invitation.workspace_id,
          user_id: userId,
          role: invitation.role,
        },
      });

      // 2. Mark invitation as accepted
      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      });
    });

    // Fetch user profile for activity logging
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { full_name: true, email: true },
    });

    // 3. Log activity
    await logActivity({
      workspaceId: invitation.workspace_id,
      actorId: userId,
      action: "member.joined",
      targetType: "member",
      targetId: userId,
      metadata: {
        target_name: profile?.full_name || profile?.email || "Unknown User",
        target_email: profile?.email || "",
        role: invitation.role,
      },
    });

    return sendSuccess(res, { message: "Invitation accepted successfully", workspaceId: invitation.workspace_id });
  } catch (error) {
    return next(error);
  }
});

// POST /api/invitations/:token/decline (Auth - Decline invitation)
router.post("/:token/decline", async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const userEmail = (req.user as any).email;

  try {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return sendError(res, "Invitation not found", 404);
    }

    if (invitation.status !== "pending") {
      return sendError(res, `This invitation is no longer valid (status: ${invitation.status})`, 400);
    }

    // Verify logged-in user matches invitation email
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      return sendError(res, "You can only decline invitations sent to your email address", 403);
    }

    // Mark invitation as declined
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "declined" },
    });

    return sendSuccess(res, { message: "Invitation declined successfully" });
  } catch (error) {
    return next(error);
  }
});

export default router;
