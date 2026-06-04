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
import { useAppDispatch } from "@/store/hooks";
import { deleteTask, closeTaskDetail } from "../boardDetailSlide";
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
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteTask({ taskId, columnId })).unwrap();
      dispatch(closeTaskDetail());
      addToast("Task deleted", "success");
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast("Failed to delete task", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete this card?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete <b>"{taskTitle}"</b>.
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close to handle async
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Card"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
