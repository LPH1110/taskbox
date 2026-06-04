import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { addMemberSchema, removeMemberSchema } from "./members.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";

const router = Router();

// Protect all member routes
router.use(requireAuth);

// POST /api/boards/:boardId/members (Add Board Member by Email)
router.post("/boards/:boardId/members", requireBoardMember, validate(addMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const { userId } = req.body;

  try {
    // Find profile by userId
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return sendError(res, "User not found.", 404);
    }

    // Check if owner of board
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { owner_id: true },
    });

    if (board?.owner_id === userId) {
      return sendError(res, "User is already the owner of this board.", 400);
    }

    // Check if already a member
    const existing = await prisma.boardMember.findUnique({
      where: {
        board_id_user_id: {
          board_id: boardId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      return sendError(res, "User is already a member of this board.", 400);
    }

    // Create member record
    const member = await prisma.boardMember.create({
      data: {
        board_id: boardId,
        user_id: userId,
        role: "member", // Default role
      },
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
      board_id: member.board_id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      profiles: member.profile,
    };

    socketEmitter.toBoardRoom(boardId, "member:event", {
      member: adaptedMember,
      type: "INSERT",
    });

    return sendSuccess(res, adaptedMember, 201);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/boards/:boardId/members/:userId (Remove Board Member)
router.delete("/boards/:boardId/members/:userId", requireBoardMember, validate(removeMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId, userId } = req.params;

  try {
    await prisma.taskAssignee.deleteMany({
      where: {
        user_id: userId,
        task: { board_id: boardId },
      },
    });

    await prisma.boardMember.delete({
      where: {
        board_id_user_id: {
          board_id: boardId,
          user_id: userId,
        },
      },
    });

    socketEmitter.toBoardRoom(boardId, "member:event", {
      member: { board_id: boardId, user_id: userId } as any,
      type: "DELETE",
    });

    return sendSuccess(res, userId);
  } catch (error) {
    return next(error);
  }
});

export default router;
