import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: { id: string; email: string }, expiresIn: SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, env.JWT_SECRET);
}
