import { type TimelineTask } from "../plannerSlice";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface MonthViewProps {
  tasks: TimelineTask[];
  currentDate: string;
}

export function MonthView({ tasks, currentDate }: MonthViewProps) {
  const navigate = useNavigate();
  const date = new Date(currentDate);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);

  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = new Date();

  const handleTaskClick = (task: TimelineTask, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/boards/${task.board.id}`, { state: { openTaskId: task.id } });
  };

  return (
    <div className="flex flex-col h-full w-full bg-card/50 rounded-xl border border-white/10 overflow-hidden shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-7 border-b border-white/10 bg-muted/30">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, today);
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day));

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-1.5 border-r border-b border-white/10 ${!isCurrentMonth ? 'bg-muted/10 opacity-50' : isToday ? 'bg-primary/5' : ''}`}
            >
              <div className={`text-xs font-medium mb-1.5 ml-1 ${isToday ? 'text-primary bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {format(day, 'd')}
              </div>

              <div className="flex flex-col gap-1 overflow-hidden h-[calc(100%-28px)] custom-scrollbar">
                <TooltipProvider>
                  {dayTasks.map(task => {
                    const isHigh = task.priority === "high";
                    const isMed = task.priority === "medium";

                    return (
                      <Tooltip key={task.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => handleTaskClick(task, e)}
                            className={`text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer transition-colors border ${isHigh ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" :
                                isMed ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20" :
                                  "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                              }`}
                          >
                            <span className="font-semibold mr-1">
                              {new Date(task.due_date).getHours() !== 12 ? format(new Date(task.due_date), 'h:mm a') : ''}
                            </span>
                            {task.content}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{task.content}</p>
                            <p className="text-xs text-muted-foreground">{task.board.title}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
