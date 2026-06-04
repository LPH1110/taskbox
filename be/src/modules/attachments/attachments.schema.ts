import { z } from "zod";

export const deleteAttachmentSchema = z.object({
  params: z.object({
    attachmentId: z.string().uuid(),
  }),
});
