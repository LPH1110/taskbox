import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { AUTOMATION_QUEUE_NAME } from "./automation.queue";
import { Logger } from "../../utils/logger";
import { AutomationService } from "./automation.service";
import { AutomationTriggerPayload } from "./automation.types";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const automationWorker = new Worker(
  AUTOMATION_QUEUE_NAME,
  async (job: Job<AutomationTriggerPayload>) => {
    Logger.info("AutomationWorker", `Processing job ${job.id} of type ${job.name}`);
    
    try {
      const result = await AutomationService.evaluateRules(job);
      
      Logger.info("AutomationWorker", `Successfully processed job ${job.id}. Executed ${result.executedRules ?? 0} rules.`);
      return result;
    } catch (error: any) {
      Logger.error("AutomationWorker", `Failed to process job ${job.id}`, error);
      throw error;
    }
  },
  {
    connection: connection as any,
    concurrency: 5, // Process up to 5 events concurrently
  }
);

automationWorker.on("completed", (job) => {
  Logger.info("AutomationWorker", `Job ${job.id} has completed!`);
});

automationWorker.on("failed", (job, err) => {
  Logger.error("AutomationWorker", `Job ${job?.id} has failed with ${err.message}`);
});

Logger.info("AutomationWorker", "Worker initialized and listening for events.");
