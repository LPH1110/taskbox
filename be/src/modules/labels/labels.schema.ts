import { z } from "zod";
import { registry } from "../../config/openapi";

export const LabelSchema = registry.register("Label", z.object({
  id: z.string().uuid(),
  title: z.string(),
  color: z.string(),
  board_id: z.string().uuid(),
  created_at: z.string().datetime(),
}));

export const createLabelBodySchema = registry.register("CreateLabelRequest", z.object({
  title: z.string().min(1),
  color: z.string().min(1),
}));

export const createLabelSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
  body: createLabelBodySchema,
});

export const updateLabelBodySchema = registry.register("UpdateLabelRequest", z.object({
  title: z.string().min(1),
  color: z.string().min(1),
}));

export const updateLabelSchema = z.object({
  params: z.object({ labelId: z.string().uuid() }),
  body: updateLabelBodySchema,
});

export const toggleTaskLabelSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
    labelId: z.string().uuid(),
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/boards/{boardId}/labels",
  tags: ["Labels"],
  summary: "Create label for board",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string().uuid() }), body: { content: { "application/json": { schema: createLabelBodySchema } } } },
  responses: { 201: { description: "Created" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/labels/{labelId}",
  tags: ["Labels"],
  summary: "Update label",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ labelId: z.string().uuid() }), body: { content: { "application/json": { schema: updateLabelBodySchema } } } },
  responses: { 200: { description: "Updated" } }
});

registry.registerPath({
  method: "delete",
  path: "/api/labels/{labelId}",
  tags: ["Labels"],
  summary: "Delete label",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ labelId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});

registry.registerPath({
  method: "post",
  path: "/api/tasks/{taskId}/labels/{labelId}",
  tags: ["Tasks", "Labels"],
  summary: "Toggle label on task",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ taskId: z.string().uuid(), labelId: z.string().uuid() }) },
  responses: { 200: { description: "Toggled" } }
});
