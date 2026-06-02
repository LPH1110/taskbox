import { z } from "zod";

export const addMemberSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});
