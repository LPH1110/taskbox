import { z } from "zod";

export const createBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    background: z.string().optional(),
    type: z.enum(["public", "private"]).default("private"),
    workspaceId: z.string().uuid(),
  }),
});

export const boardIdParamSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: z.object({
    type: z.enum(["public", "private"]).optional(),
    title: z.string().min(1).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  }),
});
