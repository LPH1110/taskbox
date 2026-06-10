import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { WorkloadDistributionItem } from "../types";

interface WorkloadPieChartProps {
  workloadDistribution: WorkloadDistributionItem[];
  unassignedTaskCount: number;
}

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#06b6d4", "#f43f5e", "#64748b", "#3b82f6", "#2dd4bf"];

export function WorkloadPieChart({ workloadDistribution, unassignedTaskCount }: WorkloadPieChartProps) {
  const chartData = workloadDistribution.map((item) => ({
    name: item.fullName,
    value: item.taskCount,
    avatarUrl: item.avatarUrl,
    isUnassigned: false,
  }));

  if (unassignedTaskCount > 0) {
    chartData.push({
      name: "Unassigned",
      value: unassignedTaskCount,
      avatarUrl: null,
      isUnassigned: true,
    });
  }

  const hasData = chartData.length > 0 && chartData.some((d) => d.value > 0);

  // Custom tooltip to render assignee details beautifully
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg shadow-md flex items-center gap-3">
          {!data.isUnassigned ? (
            <Avatar className="h-8 w-8">
              {data.avatarUrl && <AvatarImage src={data.avatarUrl} alt={data.name} />}
              <AvatarFallback className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs">
                {data.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
              UA
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{data.value} active tasks</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[420px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Workload Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Active tasks assigned per board member</p>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {hasData ? (
          <div className="w-full h-full max-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No active tasks distributed yet</div>
        )}
      </CardContent>
    </Card>
  );
}
