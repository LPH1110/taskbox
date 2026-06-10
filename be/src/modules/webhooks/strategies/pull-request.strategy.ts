import { GitHubWebhookStrategy, WebhookResult } from "./webhook-event.strategy";
import { GitHubPullRequestPayload } from "../webhooks.types";
import { prisma } from "../../../lib/prisma";
import { socketEmitter } from "../../../lib/socket-emitter";
import { invalidateBoardCache } from "../../../utils/redis";
import { Logger } from "../../../utils/logger";

const TASK_REF_REGEX = /\[(?:Fixes|Closes|Ref)\s+([A-Za-z0-9]+-\d+|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\]/gi;

function extractTaskRefs(content: string): string[] {
  const refs = new Set<string>();
  let match;
  TASK_REF_REGEX.lastIndex = 0;
  while ((match = TASK_REF_REGEX.exec(content)) !== null) {
    if (match[1]) {
      refs.add(match[1]);
    }
  }
  return Array.from(refs);
}

async function resolveTargetColumn(boardId: string, action: string, merged: boolean) {
  if (action === "opened" || action === "reopened") {
    const columns = await prisma.column.findMany({
      where: { board_id: boardId, category: "IN_PROGRESS" },
      orderBy: { position: "asc" },
    });
    if (columns.length === 0) return null;
    
    const reviewColumn = columns.find(c => 
      c.title.toLowerCase().includes("review")
    );
    return reviewColumn || columns[0];
  }

  if (action === "closed" && merged) {
    return await prisma.column.findFirst({
      where: { board_id: boardId, category: "DONE" },
      orderBy: { position: "asc" },
    });
  }

  return null;
}

export class PullRequestStrategy implements GitHubWebhookStrategy {
  async handle(payload: GitHubPullRequestPayload): Promise<WebhookResult> {
    if (!payload || !payload.pull_request) {
      return { success: false, statusCode: 400, error: "Invalid payload body structure" };
    }

    const action = payload.action;
    const pr = payload.pull_request;
    const merged = !!pr.merged;

    if (action !== "opened" && action !== "closed" && action !== "reopened") {
      return { success: true, statusCode: 200, message: `Action "${action}" does not trigger transitions` };
    }

    if (action === "closed" && !merged) {
      return { success: true, statusCode: 200, message: "PR closed without merge, ignoring transitions" };
    }

    const searchContent = `${pr.title || ""} ${pr.body || ""}`;
    const taskRefs = extractTaskRefs(searchContent);

    if (taskRefs.length === 0) {
      return { success: true, statusCode: 200, message: "No task references found in PR" };
    }

    Logger.info("GitHubWebhooks", `Found referenced tasks: ${taskRefs.join(", ")}`);

    const conditions: any[] = [];
    const repoFullName = payload.repository?.full_name;

    for (const ref of taskRefs) {
      // Check if it's a UUID (length 36) or an alias (e.g. ENG-123)
      if (ref.length === 36 && ref.includes("-")) {
        conditions.push({ 
          id: ref.toLowerCase(),
          board: { github_repo_full_name: repoFullName }
        });
      } else if (ref.includes("-")) {
        const [key, seqStr] = ref.split('-');
        conditions.push({
          sequence_id: parseInt(seqStr, 10),
          board: { key: key.toUpperCase(), github_repo_full_name: repoFullName }
        });
      }
    }

    const tasks = await prisma.task.findMany({
      where: { OR: conditions },
      select: { id: true, board_id: true, column_id: true, content: true },
    });

    if (tasks.length === 0) {
      Logger.warn("GitHubWebhooks", "None of the referenced task UUIDs found in database");
      return { success: true, statusCode: 200, message: "Referenced tasks not found" };
    }

    const tasksByBoard: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (!tasksByBoard[task.board_id]) {
        tasksByBoard[task.board_id] = [];
      }
      tasksByBoard[task.board_id].push(task);
    }

    const updatesToExecute: Record<string, string[]> = {};
    const boardsToInvalidate = new Set<string>();
    const taskColumnTransitions: Array<{ taskId: string; fromColumnId: string; toColumnId: string; boardId: string }> = [];

    for (const [boardId, boardTasks] of Object.entries(tasksByBoard)) {
      const targetColumn = await resolveTargetColumn(boardId, action, merged);
      if (!targetColumn) {
        Logger.warn("GitHubWebhooks", `Could not resolve target column for board: ${boardId} and action: ${action}`);
        continue;
      }

      for (const task of boardTasks) {
        if (task.column_id === targetColumn.id) {
          Logger.info("GitHubWebhooks", `Task ${task.id} is already in target column ${targetColumn.id}`);
          continue;
        }

        if (!updatesToExecute[targetColumn.id]) {
          updatesToExecute[targetColumn.id] = [];
        }
        updatesToExecute[targetColumn.id].push(task.id);
        boardsToInvalidate.add(boardId);
        taskColumnTransitions.push({
          taskId: task.id,
          fromColumnId: task.column_id,
          toColumnId: targetColumn.id,
          boardId,
        });
      }
    }

    if (taskColumnTransitions.length === 0) {
      return { success: true, statusCode: 200, message: "All referenced tasks are already in target columns" };
    }

    const updatePromises = Object.entries(updatesToExecute).map(([columnId, taskIds]) =>
      prisma.task.updateMany({
        where: { id: { in: taskIds } },
        data: { column_id: columnId },
      })
    );
    await prisma.$transaction(updatePromises);

    Logger.info("GitHubWebhooks", `Successfully updated ${taskColumnTransitions.length} tasks in database`);

    // Auto-assign PR author if they have linked their GitHub account
    const githubUserId = payload.pull_request.user?.id;
    let taskboxUserId: string | null = null;
    
    if (githubUserId) {
      const linkedAccount = await prisma.userGitHubAccount.findUnique({
        where: { github_user_id: githubUserId },
        select: { user_id: true }
      });
      if (linkedAccount) {
        taskboxUserId = linkedAccount.user_id;
        const assigneesData = taskColumnTransitions.map(t => ({
          task_id: t.taskId,
          user_id: taskboxUserId!
        }));
        await prisma.taskAssignee.createMany({
          data: assigneesData,
          skipDuplicates: true
        });
        Logger.info("GitHubWebhooks", `Auto-assigned user ${taskboxUserId} to updated tasks`);
      }
    }

    for (const boardId of boardsToInvalidate) {
      await invalidateBoardCache(boardId);
    }

    for (const transition of taskColumnTransitions) {
      try {
        const updatedTask = await prisma.task.findUnique({
          where: { id: transition.taskId },
        });

        if (updatedTask) {
          const taskLabels = await prisma.taskLabel.findMany({
            where: { task_id: transition.taskId },
            select: { label_id: true },
          });

          const adaptedTask = {
            ...updatedTask,
            labelIds: taskLabels.map((tl) => tl.label_id),
          };

          socketEmitter.toBoardRoom(transition.boardId, "task:upsert", adaptedTask);
          Logger.info("GitHubWebhooks", `Emitted socket task:upsert for task ${transition.taskId}`);
        }
      } catch (e) {
        Logger.error("GitHubWebhooks", `Failed to emit socket updates for task ${transition.taskId}`, e);
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Webhook processed successfully",
      data: {
        updatedTasksCount: taskColumnTransitions.length,
        transitions: taskColumnTransitions.map(t => ({ taskId: t.taskId, toColumnId: t.toColumnId })),
      }
    };
  }
}
