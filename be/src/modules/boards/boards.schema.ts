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
