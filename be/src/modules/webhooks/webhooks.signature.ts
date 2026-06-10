import crypto from "crypto";
import express, { Request, Response } from "express";

// Extend Express Request interface to hold the captured raw body buffer
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// Middleware: parse JSON and capture raw body buffer for signature validation
export const captureRawBody = express.json({
  verify: (req: Request, _res: Response, buf: Buffer) => {
    req.rawBody = buf;
  },
});

/**
 * Validates the GitHub webhook signature using timing-safe comparison.
 * Expects X-Hub-Signature-256 header in format 'sha256=<hex_hash>'.
 */
export function verifyGitHubSignature(req: Request, secret: string): boolean {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature || !req.rawBody) {
    return false;
  }

  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(req.rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
