import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDueDate, isOverdue } from "@/features/boards/utils/format-due-date";
import { Clock, ExternalLink, Flag } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import type { TimelineTask } from "../plannerSlice";

interface TimelineTaskCardProps {
  task: TimelineTask;
}

export function TimelineTaskCard({ task }: TimelineTaskCardProps) {
  const navigate = useNavigate();
  const overdue = isOverdue(task.due_date);

  const handleClick = () => {
    navigate(`/boards/${task.board.id}`, { state: { openTaskId: task.id } });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
          className={`bg-card border rounded-lg p-3 shadow-sm cursor-pointer transition-colors relative overflow-hidden text-left w-full ${overdue ? "border-destructive/50 hover:border-destructive/80" : "border-border hover:border-primary/30"
            }`}
        >
          {overdue && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
          )}

          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium leading-snug line-clamp-2">
                {task.content}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {(() => {
                const date = new Date(task.due_date);
                const hasTime = date.getHours() !== 12 || date.getMinutes() !== 0;
                if (!hasTime && !overdue) return null;
                return (
                  <Badge
                    variant={overdue ? "destructive" : "secondary"}
                    className={`text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 ${overdue ? "animate-pulse" : ""}`}
                  >
                    <Clock className="h-3 w-3" />
                    {hasTime ? formatDueDate(task.due_date, { short: true }).split(", ")[1] : "Today"}
                  </Badge>
                );
              })()}

              {task.priority && (
                <div title={`Priority: ${task.priority}`}>
                  <Flag
                    className={`h-3.5 w-3.5 ${task.priority === "high"
                      ? "text-destructive fill-destructive"
                      : task.priority === "medium"
                        ? "text-orange-500 fill-orange-500"
                        : "text-blue-500 fill-blue-500"
                      }`}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <Badge variant="outline" className="text-[9px] px-1.5 h-4 bg-muted/50 truncate max-w-[100px]">
                {task.board.title}
              </Badge>

              {task.assignees?.length > 0 && (
                <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                  {task.assignees.map((user) => {
                    const fallback = user.full_name?.substring(0, 2).toUpperCase() || "U";
                    return (
                      <Avatar key={user.id} className="inline-block h-5 w-5 border-2 border-card ring-card shadow-sm">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="text-[8px]">{fallback}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 rounded-xl shadow-lg border border-white/10" align="start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] bg-muted/30">
                {task.board.title}
              </Badge>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs font-medium">{task.column.title}</span>
            </div>
            <h4 className="font-semibold text-sm leading-tight mt-2">{task.content}</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground text-xs">Due Date</span>
              <span className={`font-medium text-xs flex items-center gap-1.5 ${overdue ? "text-destructive" : ""}`}>
                <Clock className="h-3.5 w-3.5" />
                {formatDueDate(task.due_date)}
              </span>
            </div>

            {task.priority && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">Priority</span>
                <span className="font-medium text-xs flex items-center gap-1.5 capitalize">
                  <Flag
                    className={`h-3.5 w-3.5 ${task.priority === "high"
                      ? "text-destructive fill-destructive"
                      : task.priority === "medium"
                        ? "text-orange-500 fill-orange-500"
                        : "text-blue-500 fill-blue-500"
                      }`}
                  />
                  {task.priority}
                </span>
              </div>
            )}

            {task.labels && task.labels.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs">Labels</span>
                <div className="flex flex-wrap gap-1">
                  {task.labels.map(label => (
                    <Badge key={label.id} variant="secondary" style={{ backgroundColor: label.color + "20", color: label.color, borderColor: label.color + "40" }} className="text-[10px] px-1.5 border">
                      {label.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.assignees && task.assignees.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-muted-foreground text-xs">Assignees</span>
                <div className="flex flex-col gap-2">
                  {task.assignees.map(user => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="text-[10px]">{user.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{user.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full mt-2 h-9 text-xs"
            onClick={handleClick}
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open in Board
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
