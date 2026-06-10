import { Request, Response, Router } from "express";
import { captureRawBody } from "./webhooks.signature";
import { githubSignatureMiddleware } from "./middlewares/github-signature.middleware";
import { webhookService } from "./webhooks.service";
import { sendSuccess, sendError } from "../../utils/api-response";
import { Logger } from "../../utils/logger";

const router = Router();

// Publicly accessible, mounted before global express.json to capture raw body
router.post(
  "/github",
  captureRawBody,
  githubSignatureMiddleware,
  async (req: Request, res: Response) => {
    try {
      const event = req.headers["x-github-event"];
      if (typeof event !== "string") {
        return sendError(res, "Missing or invalid x-github-event header", 400);
      }

      const result = await webhookService.processGitHubEvent(event, req.body);

      if (!result.success) {
        return sendError(res, result.error || "Failed to process webhook", result.statusCode || 500);
      }

      return sendSuccess(res, {
        message: result.message,
        ...result.data
      });
    } catch (err) {
      Logger.error("GitHubWebhooks", "Gracefully handled webhook controller exception", err);
      // Return 200 (ignored/logged) to avoid crashing the webhook worker or returning 5xx to GitHub on expected data errors
      return sendSuccess(res, { error: "Error occurred during webhook processing, logged on server." });
    }
  }
);

export default router;
