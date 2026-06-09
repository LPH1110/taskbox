import { Queue } from "bullmq";
import Redis from "ioredis";

const connectionUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(connectionUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 0,
  tls: connectionUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
});

export const AUTOMATION_QUEUE_NAME = "automation-events";

export const automationQueue = new Queue(AUTOMATION_QUEUE_NAME, {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
