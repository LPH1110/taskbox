import { z } from "zod";
import { registry } from "../../config/openapi";

export const AttachmentSchema = registry.register("Attachment", z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  file_url: z.string(),
  file_type: z.string(),
  file_size: z.number().int().nonnegative(),
  task_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  created_at: z.string().datetime(),
}));

export const deleteAttachmentSchema = z.object({
  params: z.object({ attachmentId: z.string().uuid() }),
});

registry.registerPath({
  method: "post",
  path: "/api/tasks/{taskId}/attachments",
  tags: ["Attachments"],
  summary: "Upload attachment (multipart/form-data)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ taskId: z.string().uuid() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().openapi({ type: "string", format: "binary" })
          })
        }
      }
    }
  },
  responses: { 201: { description: "Uploaded" } }
});

registry.registerPath({
  method: "delete",
  path: "/api/attachments/{attachmentId}",
  tags: ["Attachments"],
  summary: "Delete attachment",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ attachmentId: z.string().uuid() }) },
  responses: { 200: { description: "Deleted" } }
});
