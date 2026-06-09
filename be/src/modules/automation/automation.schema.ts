import { z } from "zod";

export const createAutomationRuleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    trigger: z.object({
      type: z.string(),
    }).passthrough(),
    condition: z.object({}).passthrough().optional().nullable(),
    action: z.object({
      type: z.string(),
    }).passthrough(),
    is_active: z.boolean().optional().default(true),
  }),
});
