import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { sendSuccess, sendError } from "../../utils/api-response";
import { githubService } from "./github.service";
import { env } from "../../config/env";
import { Logger } from "../../utils/logger";
import { signToken, verifyToken } from "../../utils/jwt";

const router = Router();

// GET /api/github/auth
// Initiates the GitHub OAuth flow for an authenticated user
router.get("/auth", requireAuth, (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const email = (req.user as any).email;

  const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return sendError(res, "GitHub integration is not configured on the server", 500);
  }

  // We generate a short-lived token to act as the 'state' parameter.
  // This ensures we know exactly who initiated the flow when GitHub redirects back.
  const stateToken = signToken({ id: userId, email }, "5m");

  const redirectUri = `${env.CLIENT_URL || "http://localhost:5173"}/api/github/callback`;
  const scopes = "repo user";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${stateToken}`;

  return sendSuccess(res, { url: githubAuthUrl });
});

// GET /api/github/callback
// Handles the redirect back from GitHub
router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code || !state) {
    return res.redirect(`${env.CLIENT_URL}/settings?github_error=missing_params`);
  }

  try {
    // Verify the state token to get the user ID
    const decoded = verifyToken(state);
    if (!decoded || !decoded.id) {
      Logger.warn("GitHubWebhooks", "Invalid or expired state token in GitHub callback");
      return res.redirect(`${env.CLIENT_URL}/settings?github_error=invalid_state`);
    }

    const userId = decoded.id;
    await githubService.linkGitHubAccount(userId, code);

    // Redirect back to frontend settings page with success flag
    return res.redirect(`${env.CLIENT_URL}/settings?github_success=true`);
  } catch (error: any) {
    Logger.error("GitHubWebhooks", "Error in GitHub callback", error);
    return res.redirect(`${env.CLIENT_URL}/settings?github_error=link_failed`);
  }
});

// GET /api/github/status
// Check if current user has linked their GitHub account
router.get("/status", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any).id;
    const hasLinkedAccount = await githubService.hasLinkedAccount(userId);
    return sendSuccess(res, { linked: hasLinkedAccount });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/github/auth
// Unlink GitHub account
router.delete("/auth", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any).id;
    await githubService.unlinkGitHubAccount(userId);
    return sendSuccess(res, { message: "GitHub account unlinked successfully" });
  } catch (error) {
    return next(error);
  }
});

export default router;
