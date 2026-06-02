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

export const inviteWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member"]).default("member"),
  }),
});

export const updateWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  body: z.object({
    role: z.enum(["admin", "member"]),
  }),
});

export const removeWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const createWorkspaceInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member"]).default("member"),
  }),
});

export const cancelWorkspaceInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    invitationId: z.string().uuid(),
  }),
});


