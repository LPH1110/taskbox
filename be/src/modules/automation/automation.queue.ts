import { Queue } from "bullmq";
import Redis from "ioredis";

// Reuse the same connection config
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
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
