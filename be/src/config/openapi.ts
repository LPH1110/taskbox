import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// MUST be called before any zod schemas are used for openapi
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register a global error schema since it's used everywhere
export const ErrorSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.boolean().openapi({ example: false }),
    error: z.string().openapi({ example: "Error message details" }),
  })
);

// Register a health check path manually here
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Health check endpoint",
  security: [], // No auth
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "UP" }),
            time: z.string().openapi({ example: "2026-06-08T00:10:19.000Z" }),
          }),
        },
      },
    },
  },
});

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Taskbox API",
      description: "API documentation generated dynamically with Zod and OpenAPI.",
    },
    servers: [{ url: "http://localhost:3001" }],
    security: [{ bearerAuth: [] }],
  });
}
