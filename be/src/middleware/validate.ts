import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { sendError } from "../utils/api-response";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
        return sendError(res, errorMessages, 400);
      }
      return next(error);
    }
  };
};
