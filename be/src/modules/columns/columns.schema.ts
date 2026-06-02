import { z } from "zod";

export const createColumnSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1),
  }),
});

export const updateColumnSchema = z.object({
  params: z.object({
    columnId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1),
  }),
});

export const moveColumnSchema = z.object({
  params: z.object({
    columnId: z.string().uuid(),
  }),
  body: z.object({
    targetBoardId: z.string().uuid(),
    newPosition: z.number().int().nonnegative(),
  }),
});

export const copyColumnSchema = z.object({
  params: z.object({
    columnId: z.string().uuid(),
  }),
  body: z.object({
    newTitle: z.string().min(1),
  }),
});

export const reorderColumnsSchema = z.object({
  body: z.array(
    z.object({
      id: z.string().uuid(),
      board_id: z.string().uuid(),
      position: z.number().int().nonnegative(),
      title: z.string(),
    })
  ),
});
