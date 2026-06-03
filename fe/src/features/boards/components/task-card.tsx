import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Draggable } from "@hello-pangea/dnd";
import { openTaskDetail } from "../boardDetailSlide";
import { type Task } from "../types/board-detail";
import { Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const dispatch = useAppDispatch();
  // Get all labels from store
  const allLabels = useAppSelector((state) => state.boardDetail.labels);

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
            className={`p-0 cursor-grab transition-all duration-200 border-white/20 dark:border-white/10 ${
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
              {(task.priority || task.due_date) && (
                <div className="flex items-center gap-2 mt-1">
                  {task.due_date && (() => {
                    // Check if overdue (excluding time)
                    const dueDate = new Date(task.due_date);
                    dueDate.setHours(23, 59, 59, 999);
                    const isOverdue = dueDate < new Date();
                    return (
                      <Badge
                        variant={isOverdue ? "destructive" : "secondary"}
                        className={`text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 ${isOverdue ? "animate-pulse" : ""}`}
                      >
                        <Clock className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Badge>
                    );
                  })()}
                  {task.priority && (
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-[10px] px-1 py-0 h-5"
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
