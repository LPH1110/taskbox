import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { deleteTask, closeTaskDetail } from "@/features/boards/boardDetailSlide";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  columnId: string;
  taskTitle: string;
}

export function DeleteTaskDialog({
  isOpen,
  onClose,
  taskId,
  columnId,
  taskTitle,
}: DeleteTaskDialogProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteTask({ taskId, columnId })).unwrap();
      dispatch(closeTaskDetail());
      addToast(t("task_deleted_success"), "success");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast(t("task_deleted_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("delete_task_confirm_title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_task_confirm_desc", { title: taskTitle })}
            <br />
            {t("cannot_undone")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close to handle async
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("deleting")}
              </>
            ) : (
              t("delete_task")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
