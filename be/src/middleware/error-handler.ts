import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/api-response";
import { Logger } from "../utils/logger";
import { Prisma } from "@prisma/client";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";
  let errorType = err.name || "InternalError";

  // Prisma Specific Bottlenecks & Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2024") {
      status = 503;
      errorType = "DatabaseTimeout";
      message = "Database connection pool timeout. Server is under heavy load.";
    } else if (err.code === "P2002") {
      status = 409;
      errorType = "UniqueConstraintFailed";
      message = "A record with this value already exists.";
    } else {
      errorType = `PrismaError_${err.code}`;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    status = 500;
    errorType = "DatabaseConnectionFailed";
    message = "Could not connect to the database.";
  }

  Logger.error("ErrorHandler", `[${errorType}] ${req.method} ${req.originalUrl} - ${message}`);
  
  if (status === 500 && errorType !== "DatabaseTimeout") {
     Logger.error("ErrorHandler", "Stack Trace:", err.stack);
  }

  return sendError(res, message, status);
}
