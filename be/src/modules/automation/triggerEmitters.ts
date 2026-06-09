import { automationQueue } from "./automation.queue";
import { TriggerType } from "./automation.types";

export const TriggerEmitters = {
  async emitEvent(triggerType: TriggerType, boardId: string, payload: Record<string, any>) {
    await automationQueue.add(triggerType, {
      boardId,
      triggerType,
      payload,
      depth: 0,
    });
  },

  async scheduleDueDateJobs(boardId: string, taskId: string, dueDate: Date) {
    const now = new Date();
    const msUntilDue = dueDate.getTime() - now.getTime();
    
    if (msUntilDue > 24 * 60 * 60 * 1000) {
      // Schedule approaching job (24 hours before due date)
      await automationQueue.add(
        "DUE_DATE_APPROACHING",
        {
          boardId,
          triggerType: "DUE_DATE_APPROACHING",
          payload: { taskId },
          depth: 0,
        },
        { 
          delay: msUntilDue - (24 * 60 * 60 * 1000),
          jobId: `approaching-${taskId}` // Unique ID to prevent duplicates/allow replacing
        }
      );
    }

    if (msUntilDue > 0) {
      // Schedule passed job (exactly at due date)
      await automationQueue.add(
        "DUE_DATE_PASSED",
        {
          boardId,
          triggerType: "DUE_DATE_PASSED",
          payload: { taskId },
          depth: 0,
        },
        { 
          delay: msUntilDue,
          jobId: `passed-${taskId}`
        }
      );
    }
  }
};
