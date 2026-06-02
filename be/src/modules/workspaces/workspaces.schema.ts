import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
