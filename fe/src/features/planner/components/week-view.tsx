import { type TimelineTask } from "../plannerSlice";
import { TimelineTaskCard } from "./timeline-task-card";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface WeekViewProps {
  tasks: TimelineTask[];
  currentDate: string;
}

export function WeekView({ tasks, currentDate }: WeekViewProps) {
  const startDate = startOfWeek(new Date(currentDate), { weekStartsOn: 1 }); // Monday
  
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const tasksByDay = days.reduce((acc, day) => {
    acc[day.toISOString()] = tasks.filter(t => isSameDay(new Date(t.due_date), day));
    return acc;
  }, {} as Record<string, TimelineTask[]>);

  const today = new Date();

  return (
    <div className="flex h-full w-full bg-card/50 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm backdrop-blur-sm">
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const dayTasks = tasksByDay[day.toISOString()] || [];
        
        return (
          <div 
            key={day.toISOString()} 
            className={`flex-1 flex flex-col border-r border-black/10 dark:border-white/10 last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}
          >
            <div className={`p-3 text-center border-b border-black/10 dark:border-white/10 ${isToday ? 'bg-primary/10' : 'bg-muted/30'}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
            
            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2 min-h-[300px]">
              {dayTasks.map(task => (
                <TimelineTaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
