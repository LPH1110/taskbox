export interface WorkloadDistributionItem {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  taskCount: number;
}

export interface StatusDistributionItem {
  columnId: string;
  columnTitle: string;
  category: string;
  taskCount: number;
}

export interface BoardAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCycleTimeDays: number;
  workloadDistribution: WorkloadDistributionItem[];
  taskStatusDistribution: StatusDistributionItem[];
  unassignedTaskCount: number;
}
