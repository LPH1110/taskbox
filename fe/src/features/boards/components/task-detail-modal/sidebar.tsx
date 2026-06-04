import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, CreditCard, Trash2, Plus, Paperclip } from "lucide-react";
import { AssigneePopover } from "../assignee-popover";
import { LabelPopover } from "../label-popover";
import { type Task } from "../../types/board-detail";

interface SidebarProps {
  task: Task;
  taskAssignees: any[];
  isOverdue: boolean;
  handleSetDueDate: (date: Date | null) => void;
  setIsMoveDialogOpen: (val: boolean) => void;
  setIsDeleteDialogOpen: (val: boolean) => void;
}

export function Sidebar({
  task,
  taskAssignees,
  isOverdue,
  handleSetDueDate,
  setIsMoveDialogOpen,
  setIsDeleteDialogOpen
}: SidebarProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Meta Data */}
      <div className="space-y-6">

        {/* Assignees */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
            Assignees
          </span>
          <div className="flex items-center flex-wrap gap-2">
            {taskAssignees.length > 0 ? (
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex -space-x-2">
                  <TooltipProvider>
                    {taskAssignees.map(member => {
                      const profile = member.profiles;
                      const fallback = profile?.full_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || "U";
                      return (
                        <Tooltip key={member.user_id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-background shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-pointer">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{fallback}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{profile?.full_name || profile?.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>

                <AssigneePopover taskId={task.id}>
                  <button className="h-8 w-8 rounded-full border border-dashed bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </AssigneePopover>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AssigneePopover taskId={task.id}>
                  <button className="h-8 w-8 rounded-full border border-dashed bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </AssigneePopover>
                <span className="text-sm text-muted-foreground">No assignees</span>
              </div>
            )}
          </div>
        </div>

        {/* Status/Priority */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Priority
          </span>
          <div>
            <Badge
              variant={
                task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
              }
              className="font-medium shadow-sm"
            >
              {task.priority || "No Priority"}
            </Badge>
          </div>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Due Date
            </span>
            <div>
              <Badge variant={isOverdue ? "destructive" : "secondary"} className="font-medium flex w-fit items-center gap-1.5 shadow-sm">
                <Clock className="h-3.5 w-3.5" />
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                {isOverdue && <span className="ml-1 uppercase text-[10px] bg-background/20 px-1 rounded">Overdue</span>}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Add to card Menu */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add to card
        </span>
        <div className="space-y-2">
          <AssigneePopover taskId={task.id} />
          <LabelPopover taskId={task.id} />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="w-full justify-start h-8 text-sm hover:bg-accent"
              >
                <Clock className="mr-2 h-4 w-4" />
                Dates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                selected={task.due_date ? new Date(task.due_date) : undefined}
                onSelect={(date) => handleSetDueDate(date || null)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Actions Menu */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Actions
        </span>
        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-start h-8 text-sm hover:bg-accent"
            onClick={() => {
              const fileInput = document.getElementById("task-attachment-input");
              if (fileInput) fileInput.click();
            }}
          >
            <Paperclip className="mr-2 h-4 w-4" /> Attachment
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start h-8 text-sm hover:bg-accent"
            onClick={() => setIsMoveDialogOpen(true)}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Move
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start h-8 text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
