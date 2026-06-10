import { NextFunction, Request, Response, Router } from "express";
import { requireAuth, requireBoardMember } from "../../middleware/auth";
import { sendSuccess } from "../../utils/api-response";
import { AnalyticsService } from "./analytics.service";
import { redis } from "../../utils/redis";

const router = Router();

// Protect all analytics routes
router.use(requireAuth);

// GET /api/boards/:boardId/analytics
router.get("/:boardId/analytics", requireBoardMember, async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const cacheKey = `board_analytics:${boardId}`;

  try {
    let cachedData: string | null = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (err) {
      console.warn("Redis is down, falling back to database query:", err);
    }

    if (cachedData) {
      return sendSuccess(res, JSON.parse(cachedData));
    }

    const analytics = await AnalyticsService.getBoardAnalytics(boardId);

    try {
      // Cache for 5 minutes (300 seconds)
      await redis.setex(cacheKey, 300, JSON.stringify(analytics));
    } catch (err) {
      console.warn("Failed to set Redis cache for analytics:", err);
    }

    return sendSuccess(res, analytics);
  } catch (error) {
    return next(error);
  }
});

export default router;
