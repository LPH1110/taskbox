import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTimelineTasks, setView, setCurrentDate, setSelectedBoardId, resetPlanner } from "../plannerSlice";
import { WeekView } from "../components/week-view";
import { MonthView } from "../components/month-view";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { fetchWorkspaces } from "@/features/workspaces/workspacesSlice";
import { fetchBoards } from "@/features/boards/boardsSlice";

export default function TimelinePage() {
  const { workspaceId } = useParams();
  const dispatch = useAppDispatch();
  
  const { tasks, isLoading, view, currentDate, selectedBoardId } = useAppSelector(state => state.planner);
  const { items: workspaces } = useAppSelector(state => state.workspaces);
  const { items: boards } = useAppSelector(state => state.boards);
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  
  useEffect(() => {
    dispatch(fetchWorkspaces());
    if (workspaceId) {
      dispatch(fetchBoards());
    }
    return () => { dispatch(resetPlanner()); };
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    
    let from, to;
    const date = new Date(currentDate);
    
    if (view === "week") {
      from = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
      to = endOfWeek(date, { weekStartsOn: 1 }).toISOString();
    } else {
      from = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }).toISOString();
      to = endOfWeek(endOfMonth(date), { weekStartsOn: 1 }).toISOString();
    }
    
    dispatch(fetchTimelineTasks({ workspaceId, from, to, boardId: selectedBoardId }));
  }, [dispatch, workspaceId, view, currentDate, selectedBoardId]);

  const handlePrev = () => {
    const date = new Date(currentDate);
    const newDate = view === "week" ? subWeeks(date, 1) : subMonths(date, 1);
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleNext = () => {
    const date = new Date(currentDate);
    const newDate = view === "week" ? addWeeks(date, 1) : addMonths(date, 1);
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  const headerDateString = view === "week" 
    ? `${format(startOfWeek(new Date(currentDate), { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(new Date(currentDate), { weekStartsOn: 1 }), 'MMM d, yyyy')}`
    : format(new Date(currentDate), 'MMMM yyyy');

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Timeline Planner</h1>
            <p className="text-sm text-muted-foreground">{workspace?.name || "Workspace"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-lg border border-black/5 dark:border-white/5">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 hover:bg-background">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-[180px] text-center font-medium text-sm">
            {headerDateString}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-background">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="ml-2 h-8 text-xs font-medium">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={selectedBoardId || "all"} 
              onValueChange={(val) => dispatch(setSelectedBoardId(val === "all" ? null : val))}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm bg-background">
                <SelectValue placeholder="All Boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                {boards.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-md border border-black/5 dark:border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setView("week"))}
              className={`h-7 px-3 text-xs font-medium rounded-sm ${view === "week" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setView("month"))}
              className={`h-7 px-3 text-xs font-medium rounded-sm ${view === "month" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative mt-4 min-h-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </motion.div>
          ) : tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl bg-card/30"
            >
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Deadlines Found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {selectedBoardId 
                  ? "There are no tasks with deadlines in this specific board for the selected time period."
                  : "Enjoy your free time! There are no tasks with deadlines in this workspace for the selected time period."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {view === "week" ? (
                <WeekView tasks={tasks} currentDate={currentDate} />
              ) : (
                <MonthView tasks={tasks} currentDate={currentDate} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
