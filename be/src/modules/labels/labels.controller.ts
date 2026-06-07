import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import {
  createLabelSchema,
  updateLabelSchema,
  toggleTaskLabelSchema,
} from "./labels.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";
import { invalidateBoardCache } from "../../utils/redis";

const router = Router();

// Protect all label routes
router.use(requireAuth);

async function getBoardIdForLabel(labelId: string) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
    select: { board_id: true },
  });
  return label?.board_id;
}

async function getBoardIdForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board_id: true },
  });
  return task?.board_id;
}

// POST /api/boards/:boardId/labels (Create Label)
router.post("/boards/:boardId/labels", requireBoardMember, validate(createLabelSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const { title, color } = req.body;

  try {
    const label = await prisma.label.create({
      data: {
        board_id: boardId,
        title,
        color,
      },
    });

    socketEmitter.toBoardRoom(boardId, "label:upsert", label);
    await invalidateBoardCache(boardId);

    return sendSuccess(res, label, 201);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/labels/:labelId (Update Label)
router.patch("/labels/:labelId", validate(updateLabelSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { labelId } = req.params;
  const { title, color } = req.body;

  try {
    const boardId = await getBoardIdForLabel(labelId);
    if (!boardId) return sendError(res, "Label not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const updated = await prisma.label.update({
          where: { id: labelId },
          data: { title, color },
        });

        socketEmitter.toBoardRoom(boardId, "label:upsert", updated);
        await invalidateBoardCache(boardId);

        return sendSuccess(res, updated);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/labels/:labelId (Delete Label)
router.delete("/labels/:labelId", async (req: Request, res: Response, next: NextFunction) => {
  const { labelId } = req.params;

  try {
    const boardId = await getBoardIdForLabel(labelId);
    if (!boardId) return sendError(res, "Label not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        await prisma.label.delete({
          where: { id: labelId },
        });

        socketEmitter.toBoardRoom(boardId, "label:delete", { id: labelId });
        await invalidateBoardCache(boardId);

        return sendSuccess(res, labelId);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/tasks/:taskId/labels/:labelId (Attach Label to Task)
router.post("/tasks/:taskId/labels/:labelId", validate(toggleTaskLabelSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId, labelId } = req.params;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const existing = await prisma.taskLabel.findUnique({
          where: {
            task_id_label_id: { task_id: taskId, label_id: labelId },
          },
        });

        if (existing) {
          return sendSuccess(res, { taskId, labelId, isAdding: true });
        }

        await prisma.taskLabel.create({
          data: {
            task_id: taskId,
            label_id: labelId,
          },
        });

        socketEmitter.toBoardRoom(boardId, "taskLabel:event", {
          task_id: taskId,
          label_id: labelId,
          type: "INSERT",
        });
        await invalidateBoardCache(boardId);

        return sendSuccess(res, { taskId, labelId, isAdding: true });
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/tasks/:taskId/labels/:labelId (Detach Label from Task)
router.delete("/tasks/:taskId/labels/:labelId", validate(toggleTaskLabelSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId, labelId } = req.params;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        await prisma.taskLabel.delete({
          where: {
            task_id_label_id: { task_id: taskId, label_id: labelId },
          },
        });

        socketEmitter.toBoardRoom(boardId, "taskLabel:event", {
          task_id: taskId,
          label_id: labelId,
          type: "DELETE",
        });
        await invalidateBoardCache(boardId);

        return sendSuccess(res, { taskId, labelId, isAdding: false });
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
