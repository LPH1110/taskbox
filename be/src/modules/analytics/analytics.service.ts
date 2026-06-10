import { prisma } from "../../lib/prisma";

export interface BoardAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCycleTimeDays: number;
  workloadDistribution: {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    taskCount: number;
  }[];
  taskStatusDistribution: {
    columnId: string;
    columnTitle: string;
    category: string;
    taskCount: number;
  }[];
  unassignedTaskCount: number;
}

export class AnalyticsService {
  static async getBoardAnalytics(boardId: string): Promise<BoardAnalytics> {
    // 1. Total tasks & completed tasks count
    const totalTasks = await prisma.task.count({
      where: { board_id: boardId },
    });

    const completedTasks = await prisma.task.count({
      where: {
        board_id: boardId,
        column: { category: "DONE" },
      },
    });

    const completionRate = totalTasks > 0 
      ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) 
      : 0;

    // 2. Average lead/cycle time in days for completed tasks
    const doneTasks = await prisma.task.findMany({
      where: {
        board_id: boardId,
        column: { category: "DONE" },
      },
      select: { created_at: true },
    });

    let avgCycleTimeDays = 0;
    if (doneTasks.length > 0) {
      const totalDurationMs = doneTasks.reduce((sum, task) => {
        const duration = Date.now() - new Date(task.created_at).getTime();
        return sum + duration;
      }, 0);
      const avgMs = totalDurationMs / doneTasks.length;
      avgCycleTimeDays = parseFloat((avgMs / (1000 * 60 * 60 * 24)).toFixed(1));
    }

    // 3. Workload Distribution: active tasks per user (excluding DONE column)
    const assigneesData = await prisma.taskAssignee.findMany({
      where: {
        task: {
          board_id: boardId,
          column: { category: { not: "DONE" } },
        },
      },
      include: {
        profile: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    const workloadMap = new Map<string, { userId: string; fullName: string; avatarUrl: string | null; taskCount: number }>();
    for (const item of assigneesData) {
      if (!item.profile) continue;
      const existing = workloadMap.get(item.user_id);
      if (existing) {
        existing.taskCount += 1;
      } else {
        workloadMap.set(item.user_id, {
          userId: item.user_id,
          fullName: item.profile.full_name || "Unknown User",
          avatarUrl: item.profile.avatar_url,
          taskCount: 1,
        });
      }
    }
    const workloadDistribution = Array.from(workloadMap.values());

    // 4. Status distribution: task count per column
    const columns = await prisma.column.findMany({
      where: { board_id: boardId },
      select: {
        id: true,
        title: true,
        category: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { position: "asc" },
    });

    const taskStatusDistribution = columns.map((c) => ({
      columnId: c.id,
      columnTitle: c.title,
      category: c.category,
      taskCount: c._count.tasks,
    }));

    // 5. Unassigned tasks count (excluding DONE column)
    const unassignedTaskCount = await prisma.task.count({
      where: {
        board_id: boardId,
        column: { category: { not: "DONE" } },
        assignees: { none: {} },
      },
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      avgCycleTimeDays,
      workloadDistribution,
      taskStatusDistribution,
      unassignedTaskCount,
    };
  }
}
