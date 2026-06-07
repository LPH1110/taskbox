import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import { socketEmitter } from "../../lib/socket-emitter";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendError, sendSuccess } from "../../utils/api-response";
import { invalidateBoardCache } from "../../utils/redis";
import {
  copyColumnSchema,
  createColumnSchema,
  moveColumnSchema,
  reorderColumnsSchema
} from "./columns.schema";

const router = Router();

// Protect all column routes
router.use(requireAuth);

// helper to get boardId of a column
async function getBoardIdForColumn(columnId: string) {
  const col = await prisma.column.findUnique({
    where: { id: columnId },
    select: { board_id: true },
  });
  return col?.board_id;
}

// POST /api/boards/:boardId/columns (Create Column)
router.post("/boards/:boardId/columns", requireBoardMember, validate(createColumnSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const { title } = req.body;

  try {
    const count = await prisma.column.count({
      where: { board_id: boardId },
    });

    const col = await prisma.column.create({
      data: {
        board_id: boardId,
        title,
        position: count,
      },
    });

    const responseData = {
      ...col,
      taskIds: [],
    };

    socketEmitter.toBoardRoom(boardId, "column:upsert", responseData);
    await invalidateBoardCache(boardId);

    return sendSuccess(res, responseData, 201);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/columns/:columnId (Update Column Title)
router.patch("/columns/:columnId", async (req: Request, res: Response, next: NextFunction) => {
  const { columnId } = req.params;
  const { title } = req.body;

  try {
    const boardId = await getBoardIdForColumn(columnId);
    if (!boardId) return sendError(res, "Column not found", 404);

    // Call authorize callback manually
    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);
      try {
        const updated = await prisma.column.update({
          where: { id: columnId },
          data: { title },
        });

        socketEmitter.toBoardRoom(boardId, "column:upsert", updated);
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

// PATCH /api/columns/:columnId/move (Move column to different board)
router.patch("/columns/:columnId/move", validate(moveColumnSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { columnId } = req.params;
  const { targetBoardId, newPosition } = req.body;

  try {
    const sourceBoardId = await getBoardIdForColumn(columnId);
    if (!sourceBoardId) return sendError(res, "Column not found", 404);

    // Authorize source board member
    req.params.boardId = sourceBoardId;
    return requireBoardMember(req, res, (err) => {
      if (err) return next(err);

      // Authorize target board member
      req.params.boardId = targetBoardId;
      return requireBoardMember(req, res, async (err2) => {
        if (err2) return next(err2);

        try {
          // Perform transaction to update positions of other columns in source board
          // and move the target column
          const result = await prisma.$transaction(async (tx: any) => {
            const updated = await tx.column.update({
              where: { id: columnId },
              data: {
                board_id: targetBoardId,
                position: newPosition,
              },
            });

            // Cascade tasks board_id update since they moved boards too
            await tx.task.updateMany({
              where: { column_id: columnId },
              data: { board_id: targetBoardId },
            });

            return updated;
          });

          // Notify source board room (remove column)
          socketEmitter.toBoardRoom(sourceBoardId, "column:delete", { id: columnId });

          // Fetch columns of new board to broadcast correctly, or let client handle detail reload
          const targetColWithTasks = {
            ...result,
            taskIds: (await prisma.task.findMany({
              where: { column_id: columnId },
              select: { id: true },
            })).map((t: any) => t.id),
          };

          // Notify destination board room (add column)
          socketEmitter.toBoardRoom(targetBoardId, "column:upsert", targetColWithTasks);
          
          await invalidateBoardCache(sourceBoardId);
          await invalidateBoardCache(targetBoardId);

          return sendSuccess(res, result);
        } catch (e) {
          return next(e);
        }
      });
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/columns/:columnId/copy (Copy column + tasks)
router.post("/columns/:columnId/copy", validate(copyColumnSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { columnId } = req.params;
  const { newTitle } = req.body;

  try {
    const boardId = await getBoardIdForColumn(columnId);
    if (!boardId) return sendError(res, "Column not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        const col = await prisma.column.findUnique({
          where: { id: columnId },
        });

        if (!col) return sendError(res, "Column not found", 404);

        const tasks = await prisma.task.findMany({
          where: { column_id: columnId },
          orderBy: { position: "asc" },
        });

        // Duplicate inside transaction
        const result = await prisma.$transaction(async (tx: any) => {
          const newCol = await tx.column.create({
            data: {
              board_id: boardId,
              title: newTitle,
              position: col.position + 1, // Place directly next to original
            },
          });

          // Shift other columns up to accommodate the new column
          await tx.column.updateMany({
            where: {
              board_id: boardId,
              position: { gte: col.position + 1 },
              id: { not: newCol.id },
            },
            data: {
              position: { increment: 1 },
            },
          });

          const createdTasks = [];
          for (const task of tasks) {
            const newT = await tx.task.create({
              data: {
                content: task.content,
                description: task.description,
                column_id: newCol.id,
                board_id: boardId,
                priority: task.priority,
                position: task.position,
              },
            });
            createdTasks.push(newT);
          }

          return { newCol, createdTasks };
        });

        const newColumnWithIds = {
          ...result.newCol,
          taskIds: result.createdTasks.map((t: any) => t.id),
        };

        // Notify client
        socketEmitter.toBoardRoom(boardId, "column:upsert", newColumnWithIds);
        result.createdTasks.forEach((t: any) => {
          socketEmitter.toBoardRoom(boardId, "task:upsert", { ...t, labelIds: [] });
        });
        await invalidateBoardCache(boardId);

        return sendSuccess(res, {
          newColumn: result.newCol,
          newTasks: result.createdTasks,
          originalColumnId: columnId,
        });
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/columns/:columnId (Delete column + tasks)
router.delete("/columns/:columnId", async (req: Request, res: Response, next: NextFunction) => {
  const { columnId } = req.params;

  try {
    const boardId = await getBoardIdForColumn(columnId);
    if (!boardId) return sendError(res, "Column not found", 404);

    req.params.boardId = boardId;
    return requireBoardMember(req, res, async (err) => {
      if (err) return next(err);

      try {
        await prisma.column.delete({
          where: { id: columnId },
        });

        socketEmitter.toBoardRoom(boardId, "column:delete", { id: columnId });
        await invalidateBoardCache(boardId);

        return sendSuccess(res, columnId);
      } catch (e) {
        return next(e);
      }
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/columns/reorder (Batch Column positions)
router.put("/columns/reorder", validate(reorderColumnsSchema), async (req: Request, res: Response, next: NextFunction) => {
  const updates = req.body;
  if (updates.length === 0) return sendSuccess(res, []);

  // Use the board_id from the first column update
  const boardId = updates[0].board_id;

  req.params = req.params || {};
  req.params.boardId = boardId;
  return requireBoardMember(req, res, async (err) => {
    if (err) return next(err);

    try {
      // Execute all updates inside transaction
      await prisma.$transaction(
        updates.map((update: any) =>
          prisma.column.update({
            where: { id: update.id },
            data: { position: update.position },
          })
        )
      );

      // Broadcast new ordering to all users
      // To prevent race conditions, just notify detail page columns are reordered
      // RTK client expects the original updates list payload
      socketEmitter.toBoardRoom(boardId, "column:reorder", updates);
      await invalidateBoardCache(boardId);

      return sendSuccess(res, updates);
    } catch (e) {
      return next(e);
    }
  });
});

export default router;
