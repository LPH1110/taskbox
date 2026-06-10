import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusDistributionItem } from "../types";

interface StatusBarChartProps {
  taskStatusDistribution: StatusDistributionItem[];
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "TODO":
      return "#0ea5e9"; // Sky Blue
    case "DONE":
      return "#10b981"; // Emerald
    default:
      return "#f59e0b"; // Amber (IN_PROGRESS)
  }
};

export function StatusBarChart({ taskStatusDistribution }: StatusBarChartProps) {
  const hasData = taskStatusDistribution.length > 0 && taskStatusDistribution.some((d) => d.taskCount > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg shadow-md">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{data.category}</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.columnTitle}</p>
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium">{data.taskCount} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[420px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Status Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Task counts grouped by columns & categories</p>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {hasData ? (
          <div className="w-full h-full max-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskStatusDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                <XAxis
                  dataKey="columnTitle"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100, 116, 139, 0.04)" }} />
                <Bar
                  dataKey="taskCount"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                  animationDuration={800}
                >
                  {taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No tasks in columns to display</div>
        )}
      </CardContent>
    </Card>
  );
}
