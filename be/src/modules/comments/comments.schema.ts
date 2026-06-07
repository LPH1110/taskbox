import { z } from "zod";
import { registry } from "../../config/openapi";

export const CommentSchema = registry.register("Comment", z.object({
  id: z.string().uuid(),
  content: z.string(),
  task_id: z.string().uuid(),
  user_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
}));

export const createCommentBodySchema = registry.register("CreateCommentRequest", z.object({
  content: z.string().min(1),
  parentId: z.string().uuid().optional().nullable(),
}));

export const createCommentSchema = z.object({
  params: z.object({ taskId: z.string().uuid() }),
  body: createCommentBodySchema,
});

export const updateCommentBodySchema = registry.register("UpdateCommentRequest", z.object({
  content: z.string().min(1),
}));

export const updateCommentSchema = z.object({
  params: z.object({ commentId: z.string().uuid() }),
  body: updateCommentBodySchema,
});

export const deleteCommentSchema = z.object({
  params: z.object({ commentId: z.string().uuid() }),
});

registry.registerPath({
  method: "post",
  path: "/api/tasks/{taskId}/comments",
  tags: ["Comments"],
  summary: "Add a comment to a task",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ taskId: z.string().uuid() }), body: { content: { "application/json": { schema: createCommentBodySchema } } } },
  responses: { 201: { description: "Created" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/comments/{commentId}",
  tags: ["Comments"],
  summary: "Edit comment",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ commentId: z.string().uuid() }), body: { content: { "application/json": { schema: updateCommentBodySchema } } } },
  responses: { 200: { description: "Updated" } }
});

registry.registerPath({
  method: "delete",
  path: "/api/comments/{commentId}",
  tags: ["Comments"],
  summary: "Delete comment",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ commentId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});
