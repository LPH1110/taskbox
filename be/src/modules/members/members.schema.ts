import { z } from "zod";

export const addMemberSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});
