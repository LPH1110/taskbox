import { z } from "zod";
import { registry, ErrorSchema } from "../../config/openapi";

export const UserProfileSchema = registry.register(
  "UserProfile",
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    language: z.string(),
  })
);

export const registerBodySchema = registry.register(
  "RegisterRequest",
  z.object({
    email: z.string().email().openapi({ example: "user@example.com" }),
    password: z.string().min(6).openapi({ example: "password123" }),
    fullName: z.string().min(1).optional().openapi({ example: "John Doe" }),
  })
);

export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginBodySchema = registry.register(
  "LoginRequest",
  z.object({
    email: z.string().email().openapi({ example: "user@example.com" }),
    password: z.string().min(6).openapi({ example: "password123" }),
  })
);

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const AuthResponseSchema = registry.register(
  "AuthResponseData",
  z.object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      token: z.string(),
      user: UserProfileSchema,
    }),
  })
);

// --- OpenAPI Path Registration ---

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  security: [], // override global
  request: {
    body: {
      content: { "application/json": { schema: registerBodySchema } },
    },
  },
  responses: {
    201: {
      description: "Registration successful",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    400: {
      description: "Invalid input or email taken",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login with email and password",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: loginBodySchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    400: {
      description: "Invalid credentials",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Get current authenticated user profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: UserProfileSchema,
          }),
        },
      },
    },
  },
});

