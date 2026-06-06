import { Activity, BarChart3, CheckCircle2, ListTodo } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation(["boards"]);
  return (
    <div className="space-y-8 px-4 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard_overview")}</h1>
        <p className="text-muted-foreground">{t("dashboard_subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Widget 1 */}
        <div className="flex flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-border/80">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t("dashboard_total_tasks")}</h3>
            <ListTodo className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground/60 mt-1">{t("dashboard_coming_soon")}</p>
        </div>
        {/* Widget 2 */}
        <div className="flex flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-border/80">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t("dashboard_active_boards")}</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground/60 mt-1">{t("dashboard_coming_soon")}</p>
        </div>
        {/* Widget 3 */}
        <div className="flex flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-border/80">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t("dashboard_completion_rate")}</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="text-2xl font-bold">--%</div>
          <p className="text-xs text-muted-foreground/60 mt-1">{t("dashboard_coming_soon")}</p>
        </div>
        {/* Widget 4 */}
        <div className="flex flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-border/80">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t("dashboard_recent_activity")}</h3>
            <Activity className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground/60 mt-1">{t("dashboard_coming_soon")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 flex h-[400px] flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold leading-none tracking-tight mb-4">{t("dashboard_productivity_trend")}</h3>
          <div className="flex-1 flex items-center justify-center border-t border-dashed border-border/50">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("dashboard_chart_placeholder")}
            </p>
          </div>
        </div>
        <div className="col-span-3 flex h-[400px] flex-col rounded-sm border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold leading-none tracking-tight mb-4">{t("dashboard_recent_actions")}</h3>
          <div className="flex-1 flex items-center justify-center border-t border-dashed border-border/50">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t("dashboard_activity_placeholder")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
