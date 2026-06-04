import { z } from "zod";

export const createCommentSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1),
    parentId: z.string().uuid().optional().nullable(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid(),
  }),
});
