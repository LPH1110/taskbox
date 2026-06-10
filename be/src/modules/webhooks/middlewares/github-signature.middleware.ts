import { NextFunction, Request, Response } from "express";
import { env } from "../../../config/env";
import { sendError } from "../../../utils/api-response";
import { Logger } from "../../../utils/logger";
import { verifyGitHubSignature } from "../webhooks.signature";

export function githubSignatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = env.GITHUB_WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    Logger.error("GitHubWebhooks", "GITHUB_WEBHOOK_SECRET is not configured on the server");
    return sendError(res, "Webhook service configuration error", 500);
  }

  // Cryptographic signature verification
  if (!verifyGitHubSignature(req, secret)) {
    Logger.warn("GitHubWebhooks", "Invalid signature received on GitHub webhook endpoint");
    return sendError(res, "Unauthorized signature mismatch", 401);
  }

  next();
  return;
}
