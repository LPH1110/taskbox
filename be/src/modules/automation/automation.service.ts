import { prisma } from "../../lib/prisma";
import { Logger } from "../../utils/logger";
import { Job } from "bullmq";
import { AutomationTriggerPayload } from "./automation.types";
import { ActionHandlers } from "./actionHandlers";

export class AutomationService {
  static readonly MAX_DEPTH = 3;

  static async evaluateRules(job: Job<AutomationTriggerPayload>) {
    const { boardId, triggerType, payload } = job.data;
    // Keep depth logic at job level if we ever re-introduce recursive automation
    const depth = job.data.depth || 0;

    if (depth >= this.MAX_DEPTH) {
      Logger.warn("AutomationService", `Maximum automation depth reached (${this.MAX_DEPTH}) for board ${boardId}. Aborting.`);
      return { status: "aborted", reason: "max_depth_reached" };
    }

    const rules = await prisma.automationRule.findMany({
      where: {
        board_id: boardId,
        is_active: true,
      },
    });

    const matchingRules = rules.filter((rule) => {
      const trigger = rule.trigger as any;
      if (trigger?.type !== triggerType) return false;

      if (rule.condition) {
        const condition = rule.condition as any;
        for (const [key, value] of Object.entries(condition)) {
          if (payload[key] !== value) {
            return false;
          }
        }
      }
      return true;
    });

    if (matchingRules.length === 0) {
      return { status: "success", executedRules: 0 };
    }

    let executedRules = 0;

    for (const rule of matchingRules) {
      try {
        await this.executeAction(rule, payload, boardId);
        
        await prisma.automationLog.create({
          data: {
            rule_id: rule.id,
            status: "success",
            metadata: payload,
          }
        });
        executedRules++;
      } catch (err: any) {
        Logger.error("AutomationService", `Rule execution failed for rule ${rule.id}`, err);
        await prisma.automationLog.create({
          data: {
            rule_id: rule.id,
            status: "failure",
            error: err.message,
            metadata: payload,
          }
        });
      }
    }

    return { status: "success", executedRules };
  }

  private static async executeAction(rule: any, triggerPayload: any, boardId: string) {
    const action = rule.action as any;
    
    switch (action.type) {
      case "MOVE_TO_COLUMN":
        await ActionHandlers.executeMoveToColumn(action, triggerPayload, boardId);
        break;
      case "ASSIGN_USER":
        await ActionHandlers.executeAssignUser(action, triggerPayload, boardId);
        break;
      case "ADD_LABEL":
        await ActionHandlers.executeAddLabel(action, triggerPayload, boardId);
        break;
      case "REMOVE_LABEL":
        await ActionHandlers.executeRemoveLabel(action, triggerPayload, boardId);
        break;
      case "SET_DUE_DATE":
        await ActionHandlers.executeSetDueDate(action, triggerPayload, boardId);
        break;
      case "SEND_EMAIL_NOTIFICATION":
        await ActionHandlers.executeSendEmailNotification(action, triggerPayload, boardId);
        break;
      case "POST_COMMENT":
        await ActionHandlers.executePostComment(action, triggerPayload, boardId);
        break;
      case "ADD_CHECKLIST_TEMPLATE":
        await ActionHandlers.executeAddChecklistTemplate(action, triggerPayload, boardId);
        break;
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}
