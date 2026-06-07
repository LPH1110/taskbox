import { z } from "zod";
import { registry } from "../../config/openapi";

export const BoardSchema = registry.register("Board", z.object({
  id: z.string().uuid(),
  title: z.string(),
  workspace_id: z.string().uuid(),
  type: z.enum(["public", "private"]),
  background_image: z.string().nullable(),
  is_favorite: z.boolean(),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
}));

export const createBoardBodySchema = registry.register("CreateBoardRequest", z.object({
  title: z.string().min(1),
  background: z.string().optional(),
  type: z.enum(["public", "private"]).default("private"),
  workspaceId: z.string().uuid(),
}));

export const createBoardSchema = z.object({
  body: createBoardBodySchema,
});

export const boardIdParamSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
});

export const updateBoardBodySchema = registry.register("UpdateBoardRequest", z.object({
  type: z.enum(["public", "private"]).optional(),
  title: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
}));

export const updateBoardSchema = z.object({
  params: z.object({
    boardId: z.string().uuid(),
  }),
  body: updateBoardBodySchema,
});

registry.registerPath({
  method: "post",
  path: "/api/boards",
  tags: ["Boards"],
  summary: "Create a new board",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: createBoardBodySchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: BoardSchema }) } } } }
});

registry.registerPath({
  method: "patch",
  path: "/api/boards/{boardId}",
  tags: ["Boards"],
  summary: "Update board details",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string().uuid() }), body: { content: { "application/json": { schema: updateBoardBodySchema } } } },
  responses: { 200: { description: "Updated", content: { "application/json": { schema: z.object({ success: z.boolean(), data: BoardSchema }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/boards/{boardId}",
  tags: ["Boards"],
  summary: "Get board details",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string().uuid() }) },
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: BoardSchema }) } } } }
});

registry.registerPath({
  method: "delete",
  path: "/api/boards/{boardId}",
  tags: ["Boards"],
  summary: "Delete board",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});
