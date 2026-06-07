import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    const msg = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`;
    
    // During extreme load testing, we might want to suppress 200 OK logs to save I/O overhead,
    // but for debugging it's useful to log them.
    if (isError) {
      Logger.warn("HTTP", msg);
    } else if (process.env.NODE_ENV !== "production") {
      // Only log successful requests in dev mode to keep load test logs clean
      Logger.info("HTTP", msg);
    }
  });
  next();
}
