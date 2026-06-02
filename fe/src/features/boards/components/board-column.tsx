/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEditable } from "@/components/ui/inline-editable";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";
import { useAppDispatch } from "@/store/hooks";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowRightLeft, Copy, MoreHorizontal, Plus, X } from "lucide-react";
import { useState } from "react";
import { createTask, updateColumn } from "../boardDetailSlide";
import { type Column, type Task } from "../types/board-detail";
import { CopyColumnDialog } from "./copy-column-dialog";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { MoveAllTasksDialog } from "./move-all-tasks-dialog";
import { MoveColumnDialog } from "./move-column-dialog";
import { TaskCard } from "./task-card";
import { useParams } from "react-router-dom";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  index: number;
}

export function BoardColumn({ column, tasks, index }: BoardColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const { boardId } = useParams();

  // Dialog states
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isMoveAllDialogOpen, setIsMoveAllDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const handleRenameColumn = async (newTitle: string) => {
    if (newTitle === column.title) return;

    try {
      await dispatch(
        updateColumn({ columnId: column.id, title: newTitle })
      ).unwrap();
    } catch (error) {
      addToast("Failed to rename list", "error");
      throw error;
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await dispatch(
      createTask({ columnId: column.id, boardId: boardId!, content })
    );
    setContent("");
    setIsEditing(false);
  };

  // Allow submitting with Enter key (shift+enter for new line)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask(e);
    }
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="max-h-full h-fit flex flex-col w-70 rounded-xl bg-muted/50 border shadow-sm shrink-0"
          >
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between p-3 font-semibold text-sm cursor-grab active:cursor-grabbing"
            >
              <div
                className="flex-1 mr-2 min-w-0 cursor-auto"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <InlineEditable
                  value={column.title}
                  onSave={handleRenameColumn}
                  className="px-1 font-semibold text-sm"
                  inputClassName="font-semibold text-sm h-7 px-1 bg-background"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>List Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsCopyDialogOpen(true)}>
                    <Copy className="mr-2 h-4 w-4" /> Copy List
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsMoveDialogOpen(true)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Move List
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setIsMoveAllDialogOpen(true)}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Move All Cards
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50/10 cursor-pointer"
                    onSelect={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Droppable droppableId={column.id} type="task">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 transition-colors min-h-2.5 ${
                    snapshot.isDraggingOver ? "bg-muted/80" : ""
                  }`}
                >
                  {tasks.map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className="p-3">
              {isEditing ? (
                <form onSubmit={handleCreateTask} className="space-y-2">
                  <Textarea
                    placeholder="Enter a title for this card..."
                    className="min-h-20 bg-background resize-none focus-visible:ring-1"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm">
                      Add Card
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="w-full justify-start text-muted-foreground hover:bg-background h-9 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a card
                </Button>
              )}
            </div>
          </div>
        )}
      </Draggable>
      <MoveColumnDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        columnId={column.id}
        columnTitle={column.title}
      />
      <CopyColumnDialog
        isOpen={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        columnId={column.id}
        columnTitle={column.title}
      />
      <MoveAllTasksDialog
        isOpen={isMoveAllDialogOpen}
        onClose={() => setIsMoveAllDialogOpen(false)}
        sourceColumnId={column.id}
        sourceColumnTitle={column.title}
      />
      <DeleteColumnDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        columnId={column.id}
        columnTitle={column.title}
        taskCount={tasks.length}
      />
    </>
  );
}
