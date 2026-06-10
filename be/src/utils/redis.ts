import Redis from "ioredis";
import { Logger } from "./logger";

const connectionUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(connectionUrl, {
  family: 0,
  tls: connectionUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
});

redis.on("connect", () => {
  Logger.info("Redis", "Connected to Redis successfully");
});

redis.on("error", (err) => {
  Logger.error("Redis", "Redis connection error", err);
});

export const invalidateBoardCache = async (boardId: string) => {
  try {
    await redis.del(`board_detail:${boardId}`);
    await invalidateAnalyticsCache(boardId);
  } catch (err) {
    Logger.error("Redis", `Failed to invalidate cache for board ${boardId}`, err);
  }
};

export const invalidateAnalyticsCache = async (boardId: string) => {
  try {
    await redis.del(`board_analytics:${boardId}`);
  } catch (err) {
    Logger.error("Redis", `Failed to invalidate analytics cache for board ${boardId}`, err);
  }
};
