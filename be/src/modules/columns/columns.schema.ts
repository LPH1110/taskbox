import { z } from "zod";
import { registry } from "../../config/openapi";

export const ColumnSchema = registry.register("Column", z.object({
  id: z.string().uuid(),
  title: z.string(),
  board_id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
}));

export const createColumnBodySchema = registry.register("CreateColumnRequest", z.object({
  title: z.string().min(1),
}));

export const createColumnSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
  body: createColumnBodySchema,
});

export const updateColumnBodySchema = registry.register("UpdateColumnRequest", z.object({
  title: z.string().min(1),
}));

export const updateColumnSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
  body: updateColumnBodySchema,
});

export const moveColumnBodySchema = registry.register("MoveColumnRequest", z.object({
  targetBoardId: z.string().uuid(),
  newPosition: z.number().int().nonnegative(),
}));

export const moveColumnSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
  body: moveColumnBodySchema,
});

export const copyColumnBodySchema = registry.register("CopyColumnRequest", z.object({
  newTitle: z.string().min(1),
}));

export const copyColumnSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
  body: copyColumnBodySchema,
});

export const reorderColumnsBodySchema = registry.register("ReorderColumnsRequest", z.array(
  z.object({
    id: z.string().uuid(),
    board_id: z.string().uuid(),
    position: z.number().int().nonnegative(),
    title: z.string(),
  })
));

export const reorderColumnsSchema = z.object({
  body: reorderColumnsBodySchema,
});

registry.registerPath({
  method: "post",
  path: "/api/boards/{boardId}/columns",
  tags: ["Columns"],
  summary: "Create a new column",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ boardId: z.string().uuid() }), body: { content: { "application/json": { schema: createColumnBodySchema } } } },
  responses: { 201: { description: "Created" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/columns/{columnId}",
  tags: ["Columns"],
  summary: "Update column title",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string().uuid() }), body: { content: { "application/json": { schema: updateColumnBodySchema } } } },
  responses: { 200: { description: "Updated" } }
});

registry.registerPath({
  method: "delete",
  path: "/api/columns/{columnId}",
  tags: ["Columns"],
  summary: "Delete column",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/columns/{columnId}/move",
  tags: ["Columns"],
  summary: "Move column to another board/position",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string().uuid() }), body: { content: { "application/json": { schema: moveColumnBodySchema } } } },
  responses: { 200: { description: "Moved" } }
});

registry.registerPath({
  method: "post",
  path: "/api/columns/{columnId}/copy",
  tags: ["Columns"],
  summary: "Copy column",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string().uuid() }), body: { content: { "application/json": { schema: copyColumnBodySchema } } } },
  responses: { 201: { description: "Copied" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/columns/reorder",
  tags: ["Columns"],
  summary: "Reorder columns in board",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: reorderColumnsBodySchema } } } },
  responses: { 200: { description: "Reordered" } }
});
