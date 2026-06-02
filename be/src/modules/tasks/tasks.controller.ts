import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { validate } from "../../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  moveAllTasksSchema,
} from "./tasks.schema";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { socketEmitter } from "../../lib/socket-emitter";

const router = Router();

// Protect all task routes
router.use(requireAuth);

async function getBoardIdForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { board_id: true },
  });
  return task?.board_id;
}

// POST /api/columns/:columnId/tasks (Create Task)
router.post("/columns/:columnId/tasks", validate(createTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { columnId } = req.params;
  const { boardId, content } = req.body;

  req.params.boardId = boardId;
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);

    try {
      const count = await prisma.task.count({
        where: { column_id: columnId },
      });

      const task = await prisma.task.create({
        data: {
          content,
          column_id: columnId,
          board_id: boardId,
          position: count,
        },
      });

      // Format matching frontend expectations (labelIds)
      const adaptedTask = {
        ...task,
        labelIds: [],
      };

      socketEmitter.toBoardRoom(boardId, "task:upsert", adaptedTask);

      return sendSuccess(res, adaptedTask, 201);
    } catch (error) {
      return next(error);
    }
  });
});

// PATCH /api/tasks/:taskId (Update Task)
router.patch("/tasks/:taskId", validate(updateTaskSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const updates = req.body;

  try {
    const boardId = await getBoardIdForTask(taskId);
    if (!boardId) return sendError(res, "Task not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const updated = await prisma.task.update({
          where: { id: taskId },
          data: updates,
        });

        // Retrieve labels attached to task to maintain state integrity
        const taskLabels = await prisma.taskLabel.findMany({
          where: { task_id: taskId },
          select: { label_id: true },
        });

        const adaptedTask = {
          ...updated,
          labelIds: taskLabels.map((tl) => tl.label_id),
        };

        socketEmitter.toBoardRoom(boardId, "task:upsert", adaptedTask);

        return sendSuccess(res, adaptedTask);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/tasks/:taskId
router.delete("/tasks/:taskId", async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { board_id: true, column_id: true },
    });

    if (!task) return sendError(res, "Task not found", 404);

    req.params.boardId = task.board_id;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        await prisma.task.delete({
          where: { id: taskId },
        });

        socketEmitter.toBoardRoom(task.board_id, "task:delete", {
          id: taskId,
          column_id: task.column_id,
        });

        return sendSuccess(res, { taskId, columnId: task.column_id });
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/tasks/reorder (Batch task reordering across or within columns)
router.put("/tasks/reorder", validate(reorderTasksSchema), async (req: Request, res: Response, next: NextFunction) => {
  const updates = req.body;
  if (updates.length === 0) return sendSuccess(res, []);

  const boardId = updates[0].board_id;

  req.params = req.params || {};
  req.params.boardId = boardId;
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);

    try {
      // Execute all updates inside transaction
      await prisma.$transaction(
        updates.map((update: any) =>
          prisma.task.update({
            where: { id: update.id },
            data: {
              column_id: update.column_id,
              position: update.position,
            },
          })
        )
      );

      // Notify clients
      socketEmitter.toBoardRoom(boardId, "task:reorder", updates);

      return sendSuccess(res, updates);
    } catch (e) {
      return next(e);
    }
  });
});

// POST /api/tasks/move-all (Move all tasks from source column to target column)
router.post("/tasks/move-all", validate(moveAllTasksSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { sourceColumnId, targetColumnId } = req.body;

  try {
    const col = await prisma.column.findUnique({
      where: { id: sourceColumnId },
      select: { board_id: true },
    });

    if (!col) return sendError(res, "Source column not found", 404);

    req.params = req.params || {};
    req.params.boardId = col.board_id;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        // Find maximum position in target column
        const maxTask = await prisma.task.findFirst({
          where: { column_id: targetColumnId },
          orderBy: { position: "desc" },
          select: { position: true },
        });

        const startPosition = (maxTask?.position ?? 0) + 1;

        // Fetch source tasks
        const sourceTasks = await prisma.task.findMany({
          where: { column_id: sourceColumnId },
          orderBy: { position: "asc" },
        });

        if (sourceTasks.length === 0) {
          return sendSuccess(res, { sourceColumnId, targetColumnId, movedTasks: [] });
        }

        const result = await prisma.$transaction(
          sourceTasks.map((task, index) =>
            prisma.task.update({
              where: { id: task.id },
              data: {
                column_id: targetColumnId,
                position: startPosition + index,
              },
            })
          )
        );

        socketEmitter.toBoardRoom(col.board_id, "task:move-all", {
          sourceColumnId,
          targetColumnId,
          movedTasks: result,
        });

        return sendSuccess(res, {
          sourceColumnId,
          targetColumnId,
          movedTasks: result,
        });
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
