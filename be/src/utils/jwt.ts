import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, env.JWT_SECRET);
}
