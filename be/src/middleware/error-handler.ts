import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/api-response";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("💥 Error caught by middleware:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";

  return sendError(res, message, status);
}
