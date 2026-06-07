import { z } from "zod";
import { registry, ErrorSchema } from "../../config/openapi";

export const WorkspaceSchema = registry.register("Workspace", z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logo_url: z.string().nullable(),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
}));

export const WorkspaceMemberSchema = registry.register("WorkspaceMember", z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["owner", "admin", "member"]),
  joined_at: z.string().datetime(),
  profiles: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
  })
}));

export const WorkspaceInvitationSchema = registry.register("WorkspaceInvitation", z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  token: z.string().uuid(),
  invited_by: z.string().uuid(),
  status: z.enum(["pending", "accepted", "declined", "cancelled", "expired"]),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
}));

export const ActivityLogSchema = registry.register("ActivityLog", z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  actor_id: z.string().uuid().nullable(),
  action: z.string(),
  target_type: z.string(),
  target_id: z.string().uuid().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string().datetime(),
  actor: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
  }).nullable().optional(),
}));

// Request Schemas
export const createWorkspaceBodySchema = registry.register("CreateWorkspaceRequest", z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
}));

export const createWorkspaceSchema = z.object({
  body: createWorkspaceBodySchema,
});

export const updateWorkspaceBodySchema = registry.register("UpdateWorkspaceRequest", z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
}));

export const updateWorkspaceSchema = z.object({
  body: updateWorkspaceBodySchema,
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const inviteWorkspaceMemberBodySchema = registry.register("InviteWorkspaceMemberRequest", z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
}));

export const inviteWorkspaceMemberSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: inviteWorkspaceMemberBodySchema,
});

export const updateWorkspaceMemberBodySchema = registry.register("UpdateWorkspaceMemberRequest", z.object({
  role: z.enum(["admin", "member"]),
}));

export const updateWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  body: updateWorkspaceMemberBodySchema,
});

export const removeWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const createWorkspaceInvitationSchema = inviteWorkspaceMemberSchema;

export const cancelWorkspaceInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    invitationId: z.string().uuid(),
  }),
});

// Paths
registry.registerPath({
  method: "get",
  path: "/api/workspaces",
  tags: ["Workspaces"],
  summary: "Fetch user's workspaces",
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(WorkspaceSchema) }) } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/workspaces",
  tags: ["Workspaces"],
  summary: "Create a new workspace",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: createWorkspaceBodySchema } } } },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceSchema }) } } },
    400: { description: "Invalid input", content: { "application/json": { schema: ErrorSchema } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/workspaces/{id}",
  tags: ["Workspaces"],
  summary: "Get Workspace Detail + Board count",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceSchema }) } } },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/workspaces/{id}",
  tags: ["Workspaces"],
  summary: "Update Workspace",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }), body: { content: { "application/json": { schema: updateWorkspaceBodySchema } } } },
  responses: {
    200: { description: "Updated", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceSchema }) } } }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/workspaces/{id}",
  tags: ["Workspaces"],
  summary: "Delete Workspace",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Deleted" }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/workspaces/{id}/members",
  tags: ["Workspaces"],
  summary: "Fetch all members + owner",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(WorkspaceMemberSchema) }) } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/workspaces/{id}/invitations",
  tags: ["Workspaces"],
  summary: "Create Workspace Invitation",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }), body: { content: { "application/json": { schema: inviteWorkspaceMemberBodySchema } } } },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceInvitationSchema }) } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/workspaces/{id}/invitations",
  tags: ["Workspaces"],
  summary: "Get Workspace Invitations",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(WorkspaceInvitationSchema) }) } } }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/workspaces/{id}/invitations/{invitationId}",
  tags: ["Workspaces"],
  summary: "Cancel Workspace Invitation",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid(), invitationId: z.string().uuid() }) },
  responses: {
    200: { description: "Cancelled", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceInvitationSchema }) } } }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/workspaces/{id}/members/{userId}",
  tags: ["Workspaces"],
  summary: "Promote/Demote Workspace Member role",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }), body: { content: { "application/json": { schema: updateWorkspaceMemberBodySchema } } } },
  responses: {
    200: { description: "Updated", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkspaceMemberSchema }) } } }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/workspaces/{id}/members/{userId}",
  tags: ["Workspaces"],
  summary: "Remove Workspace Member or self-leave",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }) },
  responses: {
    200: { description: "Removed" }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/workspaces/{id}/activity",
  tags: ["Workspaces"],
  summary: "Paginated activity logs",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.object({ activities: z.array(ActivityLogSchema), hasMore: z.boolean(), total: z.number(), page: z.number(), limit: z.number() }) }) } } }
  }
});
