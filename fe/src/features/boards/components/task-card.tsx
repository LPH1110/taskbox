import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Draggable } from "@hello-pangea/dnd";
import { openTaskDetail } from "../boardDetailSlide";
import { type Task } from "../types/board-detail";

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
            className={`p-0 cursor-grab hover:ring-2 hover:ring-primary/20 ${
              snapshot.isDragging ? "opacity-75 ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-3 text-sm flex flex-col gap-2">
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
              {task.priority && (
                <div className="flex">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
