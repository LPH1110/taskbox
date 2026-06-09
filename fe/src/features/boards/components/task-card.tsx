import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Draggable } from "@hello-pangea/dnd";
import { openTaskDetail } from "../boardDetailSlide";
import { type Task } from "../types/board-detail";
import { Clock, Flag, CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDueDate, isOverdue } from "../utils/format-due-date";
import { useTranslation } from "react-i18next";

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  // Get all labels from store
  const allLabels = useAppSelector((state) => state.boardDetail.labels);
  const allMembers = useAppSelector((state) => state.boardDetail.members);
  const taskChecklists = useAppSelector((state) => state.boardDetail.checklists[task.id] || []);

  const totalChecklistItems = taskChecklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const completedChecklistItems = taskChecklists.reduce((sum, cl) => sum + cl.items.filter(i => i.is_completed).length, 0);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
          onClick={() => dispatch(openTaskDetail(task.id))}
          style={{ ...provided.draggableProps.style }}
        >
          <Card
            className={`p-0 cursor-grab transition-all duration-200 border-black/10 dark:border-white/10 ${
              snapshot.isDragging 
                ? "opacity-95 ring-2 ring-primary shadow-xl" 
                : "shadow-sm hover:shadow-md hover:border-primary/30"
            }`}
          >
            <CardContent className="p-3 text-sm flex flex-col gap-2 bg-card rounded-xl">
              {task.labelIds?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.labelIds.map((labelId) => {
                    const label = allLabels[labelId];
                    if (!label) return null;
                    return (
                      <div
                        key={label.id}
                        className="h-2 w-8 rounded-full"
                        style={{ backgroundColor: label.color }}
                        title={label.title}
                      />
                    );
                  })}
                </div>
              )}
              <div className="text-sm font-medium leading-none">
                {task.content}
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  {(task.priority || task.due_date || totalChecklistItems > 0) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.due_date && (() => {
                        const isTaskOverdue = isOverdue(task.due_date);
                        return (
                          <Badge
                            variant={isTaskOverdue ? "destructive" : "secondary"}
                            className={`text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 ${isTaskOverdue ? "animate-pulse" : ""}`}
                          >
                            <Clock className="h-3 w-3" />
                            {formatDueDate(task.due_date, { short: true })}
                          </Badge>
                        );
                      })()}
                      {task.priority && (
                        <div title={t("priority_label", { priority: t(`priority_${task.priority}`) })}>
                          <Flag
                            className={`h-3.5 w-3.5 ${
                              task.priority === "high"
                                ? "text-destructive fill-destructive"
                                : task.priority === "medium"
                                ? "text-orange-500 fill-orange-500"
                                : "text-blue-500 fill-blue-500"
                            }`}
                          />
                        </div>
                      )}
                      {totalChecklistItems > 0 && (
                        <div 
                          className={`flex items-center gap-1 text-[10px] px-1.5 py-0 h-5 rounded-md ${
                            completedChecklistItems === totalChecklistItems 
                              ? "bg-green-500/20 text-green-700 dark:text-green-400" 
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <CheckSquare className="h-3 w-3" />
                          <span>{completedChecklistItems}/{totalChecklistItems}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {task.assigneeIds?.length > 0 && (
                  <div className="flex -space-x-1.5 overflow-hidden shrink-0 ml-2">
                    {task.assigneeIds.map((userId) => {
                      const member = allMembers.find((m) => m.user_id === userId);
                      if (!member) return null;
                      const profile = member.profiles;
                      const fallback = profile?.full_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || "U";
                      return (
                        <Avatar key={userId} className="inline-block h-6 w-6 border-2 border-card ring-card shadow-sm">
                          <AvatarImage src={profile?.avatar_url || ""} />
                          <AvatarFallback className="text-[10px]">{fallback}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
