import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { sendError } from "../utils/api-response";
import { prisma } from "../lib/prisma";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return sendError(res, "Unauthorized: Please log in", 401);
    }
    req.user = user;
    return next();
  })(req, res, next);
};

// Check if user is a member of the board (Authorization middleware)
export const requireBoardMember = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?.id;
  const boardId = req.params.boardId || req.body.boardId || req.query.boardId;

  if (!userId) {
    return sendError(res, "Unauthorized", 401);
  }

  if (!boardId) {
    return sendError(res, "Missing board ID for access validation", 400);
  }

  try {
    // Check if user is owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { owner_id: true },
    });

    if (!board) {
      return sendError(res, "Board not found", 404);
    }

    if (board.owner_id === userId) {
      return next();
    }

    // Check membership
    const membership = await prisma.boardMember.findUnique({
      where: {
        board_id_user_id: {
          board_id: boardId,
          user_id: userId,
        },
      },
    });

    if (!membership) {
      return sendError(res, "Forbidden: You are not a member of this board", 403);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
