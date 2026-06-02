import { Response } from "express";

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function sendSuccess<T = any>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

export function sendError(res: Response, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    error: message,
  });
}
