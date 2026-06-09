import { z } from "zod";

export const createChecklistSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
  }),
});

export const updateChecklistSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
  }),
});

export const createChecklistItemSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required"),
  }),
});

export const updateChecklistItemSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    is_completed: z.boolean().optional(),
    assignee_id: z.string().uuid().nullable().optional(),
    due_date: z.string().datetime().nullable().optional(),
  }),
});
