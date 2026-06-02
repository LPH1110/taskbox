import { z } from "zod";

export const createTaskSchema = z.object({
  params: z.object({
    columnId: z.string().uuid(),
  }),
  body: z.object({
    boardId: z.string().uuid(),
    content: z.string().min(1),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    priority: z.enum(["low", "medium", "high"]).nullable().optional(),
    position: z.number().int().nonnegative().optional(),
    column_id: z.string().uuid().optional(),
  }),
});

export const reorderTasksSchema = z.object({
  body: z.array(
    z.object({
      id: z.string().uuid(),
      column_id: z.string().uuid(),
      position: z.number().int().nonnegative(),
      board_id: z.string().uuid(),
      content: z.string(),
    })
  ),
});

export const moveAllTasksSchema = z.object({
  body: z.object({
    sourceColumnId: z.string().uuid(),
    targetColumnId: z.string().uuid(),
  }),
});
