import { z } from "zod";

export const createLabelSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1),
    color: z.string().min(1),
  }),
});

export const updateLabelSchema = z.object({
  params: z.object({
    labelId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1),
    color: z.string().min(1),
  }),
});

export const toggleTaskLabelSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
    labelId: z.string().uuid(),
  }),
});
