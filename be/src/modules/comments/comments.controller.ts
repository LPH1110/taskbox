import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { createCommentSchema, updateCommentSchema, deleteCommentSchema } from "./comments.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";

const router = Router();

router.use(requireAuth);

async function getBoardIdForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board_id: true },
  });
  return task?.board_id;
}

// GET /api/tasks/:taskId/comments
router.get("/tasks/:taskId/comments", async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const comments = await prisma.comment.findMany({
          where: { task_id: taskId },
          include: {
            author: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
        });

        return sendSuccess(res, comments);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/tasks/:taskId/comments
router.post("/tasks/:taskId/comments", validate(createCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { content, parentId } = req.body;
  const userId = (req.user as any).id;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const comment = await prisma.comment.create({
          data: {
            task_id: taskId,
            author_id: userId,
            content,
            parent_id: parentId || null,
          },
          include: {
            author: {
              select: {
                id: true,
                full_name: true,
                avatar_url: true,
                email: true,
              },
            },
          },
        });

        socketEmitter.toBoardRoom(boardId, "comment:create", { comment });

        return sendSuccess(res, comment, 201);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/comments/:commentId
router.patch("/comments/:commentId", validate(updateCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = (req.user as any).id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { board_id: true } } },
    });

    if (!comment) return sendError(res, "Comment not found", 404);
    if (comment.author_id !== userId) return sendError(res, "Only the author can edit this comment", 403);

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
          },
        },
      },
    });

    socketEmitter.toBoardRoom(comment.task.board_id, "comment:update", { comment: updated });

    return sendSuccess(res, updated);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/comments/:commentId
router.delete("/comments/:commentId", validate(deleteCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const userId = (req.user as any).id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { board_id: true, id: true } } },
    });

    if (!comment) return sendError(res, "Comment not found", 404);
    
    // Check if author or board admin (for admin, need to fetch member role)
    let isAuthorized = comment.author_id === userId;
    
    if (!isAuthorized) {
      const membership = await prisma.boardMember.findUnique({
        where: { board_id_user_id: { board_id: comment.task.board_id, user_id: userId } },
      });
      if (membership?.role === "admin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) return sendError(res, "Only the author or a board admin can delete this comment", 403);

    await prisma.comment.delete({
      where: { id: commentId },
    });

    socketEmitter.toBoardRoom(comment.task.board_id, "comment:delete", { 
      commentId, 
      taskId: comment.task.id 
    });

    return sendSuccess(res, { commentId, taskId: comment.task.id });
  } catch (error) {
    return next(error);
  }
});

export default router;
