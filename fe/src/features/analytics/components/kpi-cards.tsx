import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListTodo, CheckCircle2, TrendingUp, Clock } from "lucide-react";

interface KpiCardsProps {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCycleTimeDays: number;
}

export function KpiCards({ totalTasks, completedTasks, completionRate, avgCycleTimeDays }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      description: "Total tasks created on this board",
      bgAccent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      borderAccent: "hover:border-blue-500/30",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle2,
      description: "Tasks moved into the DONE column",
      bgAccent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      borderAccent: "hover:border-emerald-500/30",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      description: "Ratio of done to total tasks",
      bgAccent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      borderAccent: "hover:border-amber-500/30",
    },
    {
      title: "Avg Cycle Time",
      value: avgCycleTimeDays > 0 ? `${avgCycleTimeDays} days` : "N/A",
      icon: Clock,
      description: "Average lead time to complete a task",
      bgAccent: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      borderAccent: "hover:border-teal-500/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className={`transition-all duration-300 border-slate-100 dark:border-slate-800 shadow-sm ${card.borderAccent}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bgAccent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
