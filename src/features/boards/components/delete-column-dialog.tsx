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
import { deleteColumn } from "../boardDetailSlide";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnTitle: string;
  taskCount: number;
}

export function DeleteColumnDialog({
  isOpen,
  onClose,
  columnId,
  columnTitle,
  taskCount,
}: DeleteColumnDialogProps) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteColumn(columnId)).unwrap();
      addToast(`List "${columnTitle}" deleted`, "success");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast("Failed to delete list", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete this list?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete <b>"{columnTitle}"</b>.
            {taskCount > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                This will also permanently delete {taskCount} cards inside it.
              </span>
            )}
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
              "Delete List"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
