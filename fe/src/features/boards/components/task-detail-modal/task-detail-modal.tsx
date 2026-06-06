import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/context/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { closeTaskDetail, updateTask } from "../../boardDetailSlide";
import { CommentSection } from "../comment-section";
import { AttachmentSection } from "../attachment-section";
import { isOverdue } from "../../utils/format-due-date";
import { useTranslation } from "react-i18next";

import { Header } from "./header";
import { Description } from "./description";
import { Sidebar } from "./sidebar";
import { DeleteTaskDialog, MoveTaskDialog } from "../dialogs";

export function TaskDetailModal() {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { selectedTaskId, tasks, columns, labels, members } = useAppSelector(
    (state) => state.boardDetail
  );

  const task = selectedTaskId ? tasks[selectedTaskId] : null;

  const [description, setDescription] = useState(task?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task]);

  const column = task
    ? Object.values(columns).find((col) => col.taskIds.includes(task.id))
    : null;

  if (!task || !column) return null;

  // --- Handlers ---
  const handleRenameTask = async (newTitle: string) => {
    if (!newTitle.trim() || newTitle === task.content) return;
    try {
      await dispatch(
        updateTask({ taskId: task.id, updates: { content: newTitle } })
      ).unwrap();
      addToast(t("task_renamed_success"), "success");
    } catch (error) {
      addToast(t("task_renamed_failed"), "error");
    }
  };

  const handleSaveDescription = async () => {
    try {
      await dispatch(
        updateTask({ taskId: task.id, updates: { description } })
      ).unwrap();
      setIsEditingDescription(false);
      addToast(t("description_saved_success"), "success");
    } catch (error) {
      addToast(t("description_saved_failed"), "error");
    }
  };

  const handleCancelDescription = () => {
    setIsEditingDescription(false);
    setDescription(task.description || "");
  };

  const handleSetDueDate = async (date: Date | null) => {
    try {
      const due_date = date ? date.toISOString() : null;
      await dispatch(
        updateTask({ taskId: task.id, updates: { due_date } })
      ).unwrap();
      addToast(due_date ? t("due_date_updated_success") : t("due_date_removed_success"), "success");
    } catch (error) {
      addToast(t("due_date_updated_failed"), "error");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeTaskDetail());
      setIsEditingDescription(false);
    }
  };

  // Derived properties
  const taskLabels = task.labelIds.flatMap((id) => {
    const label = labels[id];
    return label ? [label] : [];
  });
  const taskAssignees = task.assigneeIds.flatMap((id) => {
    const member = members.find(m => m.user_id === id);
    return member ? [member] : [];
  });

  const isTaskOverdue = task.due_date ? isOverdue(task.due_date) : false;

  return (
    <Dialog open={!!selectedTaskId} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl! w-[95vw] h-[90vh] md:h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-card border-none shadow-2xl rounded-xl">
        <DialogTitle className="sr-only">Task details: {task.content}</DialogTitle>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
          <ScrollArea className="flex-1 h-full">
            <div className="p-6 md:p-8 space-y-8">
              {/* Header Section */}
              <Header
                task={task}
                column={column}
                taskLabels={taskLabels}
                handleRenameTask={handleRenameTask}
              />

              {/* Description Section */}
              <Description
                task={task}
                description={description}
                setDescription={setDescription}
                isEditingDescription={isEditingDescription}
                setIsEditingDescription={setIsEditingDescription}
                handleSaveDescription={handleSaveDescription}
                handleCancelDescription={handleCancelDescription}
              />

              {/* Attachments Section */}
              <AttachmentSection taskId={task.id} />

              {/* Activity/Comments Section */}
              <div className="flex gap-4">
                <Activity className="mt-0.5 h-6 w-6 text-muted-foreground shrink-0" />
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">{t("activity")}</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground">
                      {t("show_details")}
                    </Button>
                  </div>

                  <CommentSection taskId={task.id} />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* --- RIGHT COLUMN (SIDEBAR ACTIONS) --- */}
          <ScrollArea className="w-full md:w-80 bg-muted/5 border-t md:border-t-0 md:border-l flex-shrink-0 h-full">
            <Sidebar
              task={task}
              taskAssignees={taskAssignees}
              isOverdue={isTaskOverdue}
              handleSetDueDate={handleSetDueDate}
              setIsMoveDialogOpen={setIsMoveDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            />
          </ScrollArea>
        </div>
      </DialogContent>

      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        taskId={task.id}
        columnId={column.id}
        taskTitle={task.content}
      />

      <MoveTaskDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        taskId={task.id}
      />
    </Dialog>
  );
}
