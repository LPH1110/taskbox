import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoardAnalytics } from "../analyticsSlice";
import { fetchBoardDetails } from "@/features/boards/boardDetailSlide";
import { KpiCards } from "../components/kpi-cards";
import { WorkloadPieChart } from "../components/workload-pie-chart";
import { StatusBarChart } from "../components/status-bar-chart";
import { AnalyticsSkeleton } from "../components/analytics-skeleton";
import { AnalyticsEmpty } from "../components/analytics-empty";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useAppSelector((state) => state.analytics);
  const { currentBoard } = useAppSelector((state) => state.boardDetail);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardAnalytics(boardId));
      if (!currentBoard || currentBoard.id !== boardId) {
        dispatch(fetchBoardDetails(boardId));
      }
    }
  }, [dispatch, boardId, currentBoard]);

  const handleRefresh = () => {
    if (boardId) {
      dispatch(fetchBoardAnalytics(boardId));
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/40 dark:bg-slate-950/20 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  const hasTasks = data && data.totalTasks > 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background/30 backdrop-blur-md border-b border-black/5 dark:border-white/5 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/boards/${boardId}`)}
            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-sky-500" />
            <h1 className="text-lg font-bold tracking-tight">
              {currentBoard?.title ? `${currentBoard.title} Analytics` : "Board Analytics"}
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-9 border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!hasTasks && data ? (
          <AnalyticsEmpty boardId={boardId || ""} />
        ) : data ? (
          <div className="space-y-6">
            <KpiCards
              totalTasks={data.totalTasks}
              completedTasks={data.completedTasks}
              completionRate={data.completionRate}
              avgCycleTimeDays={data.avgCycleTimeDays}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <WorkloadPieChart
                workloadDistribution={data.workloadDistribution}
                unassignedTaskCount={data.unassignedTaskCount}
              />
              <StatusBarChart taskStatusDistribution={data.taskStatusDistribution} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
