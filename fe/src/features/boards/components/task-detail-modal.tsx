/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { InlineEditable } from "@/components/ui/inline-editable";

import {
  AlignLeft,
  Clock,
  CreditCard,
  Layout,
  Trash2,
  User,
} from "lucide-react";

import { useToast } from "@/context/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { closeTaskDetail, deleteTask, updateTask } from "../boardDetailSlide";
import { LabelPopover } from "./label-popover";

export function TaskDetailModal() {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { selectedTaskId, tasks, columns } = useAppSelector(
    (state) => state.boardDetail
  );

  // Get task data safely
  const task = selectedTaskId ? tasks[selectedTaskId] : null;

  const [description, setDescription] = useState(task?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Sync description when task changes
  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task]);

  const column = task
    ? Object.values(columns).find((col) => col.taskIds.includes(task.id))
    : null;

  if (!task) return null;

  // --- Handlers ---

  const handleRenameTask = async (newTitle: string) => {
    try {
      await dispatch(
        updateTask({ taskId: task.id, updates: { content: newTitle } })
      ).unwrap();
      addToast("Task renamed", "success");
    } catch (error) {
      addToast("Failed to rename task", "error");
      throw error;
    }
  };

  const handleSaveDescription = async () => {
    try {
      await dispatch(
        updateTask({ taskId: task.id, updates: { description } })
      ).unwrap();
      setIsEditingDescription(false);
      addToast("Description saved!", "success");
    } catch (error) {
      addToast("Failed to save description", "error");
    }
  };

  const handleCancelDescription = () => {
    setIsEditingDescription(false);
    setDescription(task.description || "");
  };

  const handleDeleteTask = async () => {
    if (!column) return;
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await dispatch(
          deleteTask({ taskId: task.id, columnId: column.id })
        ).unwrap();
        addToast("Task deleted", "success");
      } catch (error) {
        addToast("Failed to delete task", "error");
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeTaskDetail());
      setIsEditingDescription(false);
    }
  };

  return (
    <Dialog open={!!selectedTaskId} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl! w-full h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-card">
        <div className="flex flex-1 overflow-hidden">
          <ScrollArea className="flex-1 h-full">
            <div className="flex flex-col md:flex-row h-full">
              {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
              <div className="flex-1 p-6 space-y-6">
                {/* Title Section with InlineEditable */}
                <div className="flex gap-4">
                  <Layout className="mt-2 h-6 w-6 text-muted-foreground shrink-0" />
                  <div className="space-y-1 w-full">
                    <div className="mr-8">
                      <InlineEditable
                        value={task.content}
                        onSave={handleRenameTask}
                        className="text-xl font-semibold leading-none tracking-tight -ml-2"
                        inputClassName="text-xl font-semibold h-9"
                      />
                    </div>

                    <DialogDescription>
                      in list{" "}
                      <span className="font-medium underline decoration-dashed">
                        {column?.title}
                      </span>
                    </DialogDescription>
                  </div>
                </div>

                {/* Description Section */}
                <div className="flex gap-4">
                  <AlignLeft className="mt-1 h-6 w-6 text-muted-foreground shrink-0" />
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-sm">Description</h3>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a more detailed description..."
                        className={`min-h-32 resize-none border-none focus-visible:ring-1 transition ${
                          isEditingDescription
                            ? "bg-background ring-1 ring-ring"
                            : "bg-muted/50"
                        }`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={() => setIsEditingDescription(true)}
                      />
                      {isEditingDescription && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 transition">
                          <Button size="sm" onClick={handleSaveDescription}>
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelDescription}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Section */}
                <div className="flex gap-4">
                  <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    YOU
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Activity</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-muted-foreground"
                      >
                        Show Details
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        className="min-h-15 resize-none bg-muted/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN (SIDEBAR ACTIONS) --- */}
              <div className="w-full md:w-72 bg-muted/10 border-l p-4 space-y-6">
                {/* Meta Data */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-2">
                      Status
                    </span>
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : "secondary"
                      }
                    >
                      {task.priority || "No Priority"}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-2">
                      Assignees
                    </span>
                    <div className="flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="h-8 w-8 rounded-full border-2 border-background border-dashed bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        +
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions Menu */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    Add to card
                  </span>
                  <Button
                    variant="secondary"
                    className="w-full justify-start h-8 text-sm"
                  >
                    <User className="mr-2 h-4 w-4" /> Members
                  </Button>

                  <LabelPopover taskId={task.id} />

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-8 text-sm"
                  >
                    <Clock className="mr-2 h-4 w-4" /> Dates
                  </Button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    Actions
                  </span>
                  <Button
                    variant="secondary"
                    className="w-full justify-start h-8 text-sm"
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Move
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start h-8 text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    onClick={handleDeleteTask}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
