import { z } from "zod";
import { registry } from "../../config/openapi";

export const TaskSchema = registry.register("Task", z.object({
  id: z.string().uuid(),
  content: z.string(),
  description: z.string().nullable(),
  column_id: z.string().uuid(),
  board_id: z.string().uuid(),
  priority: z.enum(["low", "medium", "high"]).nullable(),
  position: z.number().int().nonnegative(),
  due_date: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
}));

export const createTaskBodySchema = registry.register("CreateTaskRequest", z.object({
  boardId: z.string().uuid(),
  content: z.string().min(1),
}));

export const createTaskSchema = z.object({
  params: z.object({
    columnId: z.string().uuid(),
  }),
  body: createTaskBodySchema,
});

export const updateTaskBodySchema = registry.register("UpdateTaskRequest", z.object({
  content: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  due_date: z.string().datetime().nullable().optional(),
  column_id: z.string().uuid().optional(),
}));

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
  body: updateTaskBodySchema,
});

export const reorderTasksBodySchema = registry.register("ReorderTasksRequest", z.array(
  z.object({
    id: z.string().uuid(),
    column_id: z.string().uuid(),
    position: z.number().int().nonnegative(),
    board_id: z.string().uuid(),
    content: z.string(),
  })
));

export const reorderTasksSchema = z.object({
  body: reorderTasksBodySchema,
});

export const moveAllTasksBodySchema = registry.register("MoveAllTasksRequest", z.object({
  sourceColumnId: z.string().uuid(),
  targetColumnId: z.string().uuid(),
}));

export const moveAllTasksSchema = z.object({
  body: moveAllTasksBodySchema,
});

export const toggleTaskAssigneeSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const timelineQuerySchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
  query: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
    boardId: z.string().uuid().optional(),
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/columns/{columnId}/tasks",
  tags: ["Tasks"],
  summary: "Create task",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ columnId: z.string().uuid() }), body: { content: { "application/json": { schema: createTaskBodySchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: TaskSchema }) } } } }
});

registry.registerPath({
  method: "patch",
  path: "/api/tasks/{taskId}",
  tags: ["Tasks"],
  summary: "Update task details",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ taskId: z.string().uuid() }), body: { content: { "application/json": { schema: updateTaskBodySchema } } } },
  responses: { 200: { description: "Updated", content: { "application/json": { schema: z.object({ success: z.boolean(), data: TaskSchema }) } } } }
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{taskId}",
  tags: ["Tasks"],
  summary: "Delete task",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ taskId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});

registry.registerPath({
  method: "post",
  path: "/api/tasks/{taskId}/assignees/{userId}",
  tags: ["Tasks"],
  summary: "Toggle task assignee",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ taskId: z.string().uuid(), userId: z.string().uuid() }) },
  responses: { 200: { description: "Toggled" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/tasks/reorder",
  tags: ["Tasks"],
  summary: "Reorder tasks (drag and drop)",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: reorderTasksBodySchema } } } },
  responses: { 200: { description: "Reordered" } }
});
