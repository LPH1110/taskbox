import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";
import { invalidateBoardCache } from "../../utils/redis";
import {
  createChecklistSchema,
  updateChecklistSchema,
  createChecklistItemSchema,
  updateChecklistItemSchema,
} from "./checklists.schema";

const router = Router();
router.use(requireAuth);

// Helper to get board_id from a task
async function getBoardIdForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board_id: true },
  });
  return task?.board_id;
}

// Helper to get board_id from a checklist
async function getBoardIdForChecklist(checklistId: string) {
  const checklist = await prisma.checklist.findUnique({
    where: { id: checklistId },
    include: { task: { select: { board_id: true } } },
  });
  return checklist?.task?.board_id;
}

// Helper to get board_id from an item
async function getBoardIdForChecklistItem(itemId: string) {
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: { include: { task: { select: { board_id: true } } } } },
  });
  return item?.checklist?.task?.board_id;
}

// POST /api/tasks/:taskId/checklists
router.post("/tasks/:taskId/checklists", validate(createChecklistSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { title } = req.body;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      const checklist = await prisma.checklist.create({
        data: {
          title,
          task_id: taskId,
        },
      });

      socketEmitter.toBoardRoom(boardId, "checklist:create", checklist);
      await invalidateBoardCache(boardId);

      return sendSuccess(res, checklist, 201);
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/checklists/:checklistId
router.patch("/checklists/:checklistId", validate(updateChecklistSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { checklistId } = req.params;
  const { title } = req.body;

  try {
    const boardId = await getBoardIdForChecklist(checklistId);
    if (!boardId) return sendError(res, "Checklist not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      const checklist = await prisma.checklist.update({
        where: { id: checklistId },
        data: { title },
      });

      socketEmitter.toBoardRoom(boardId, "checklist:update", checklist);
      await invalidateBoardCache(boardId);

      return sendSuccess(res, checklist);
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/checklists/:checklistId
router.delete("/checklists/:checklistId", async (req: Request, res: Response, next: NextFunction) => {
  const { checklistId } = req.params;

  try {
    const boardId = await getBoardIdForChecklist(checklistId);
    if (!boardId) return sendError(res, "Checklist not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      await prisma.checklist.delete({
        where: { id: checklistId },
      });

      socketEmitter.toBoardRoom(boardId, "checklist:delete", { id: checklistId, task_id: (await getBoardIdForChecklist(checklistId)) }); // Note task_id needed for client state mostly, but we can just send id
      await invalidateBoardCache(boardId);

      return sendSuccess(res, { id: checklistId });
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/checklists/:checklistId/items
router.post("/checklists/:checklistId/items", validate(createChecklistItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { checklistId } = req.params;
  const { content } = req.body;

  try {
    const boardId = await getBoardIdForChecklist(checklistId);
    if (!boardId) return sendError(res, "Checklist not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      const item = await prisma.checklistItem.create({
        data: {
          content,
          checklist_id: checklistId,
        },
      });

      socketEmitter.toBoardRoom(boardId, "checklistItem:create", item);
      await invalidateBoardCache(boardId);

      return sendSuccess(res, item, 201);
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/checklists/items/:itemId
router.patch("/checklists/items/:itemId", validate(updateChecklistItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { content, is_completed, assignee_id, due_date } = req.body;

  try {
    const boardId = await getBoardIdForChecklistItem(itemId);
    if (!boardId) return sendError(res, "Checklist item not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      // Strict inheritance validation for assignees
      if (assignee_id) {
        const board = await prisma.board.findUnique({
          where: { id: boardId },
          select: { owner_id: true }
        });
        
        if (board?.owner_id !== assignee_id) {
          const boardMember = await prisma.boardMember.findUnique({
            where: { board_id_user_id: { board_id: boardId, user_id: assignee_id } }
          });
          if (!boardMember) {
            return sendError(res, "Assignee must be a member of the board", 403);
          }
        }
      }

      const item = await prisma.checklistItem.update({
        where: { id: itemId },
        data: {
          ...(content !== undefined && { content }),
          ...(is_completed !== undefined && { is_completed }),
          ...(assignee_id !== undefined && { assignee_id }),
          ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        },
      });

      socketEmitter.toBoardRoom(boardId, "checklistItem:update", item);
      await invalidateBoardCache(boardId);

      return sendSuccess(res, item);
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/checklists/items/:itemId
router.delete("/checklists/items/:itemId", async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;

  try {
    const boardId = await getBoardIdForChecklistItem(itemId);
    if (!boardId) return sendError(res, "Checklist item not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      await prisma.checklistItem.delete({
        where: { id: itemId },
      });

      socketEmitter.toBoardRoom(boardId, "checklistItem:delete", { id: itemId });
      await invalidateBoardCache(boardId);

      return sendSuccess(res, { id: itemId });
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
