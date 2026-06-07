import Redis from "ioredis";
import { Logger } from "./logger";

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  Logger.info("Redis", "Connected to Redis successfully");
});

redis.on("error", (err) => {
  Logger.error("Redis", "Redis connection error", err);
});

export const invalidateBoardCache = async (boardId: string) => {
  try {
    await redis.del(`board_detail:${boardId}`);
  } catch (err) {
    Logger.error("Redis", `Failed to invalidate cache for board ${boardId}`, err);
  }
};
