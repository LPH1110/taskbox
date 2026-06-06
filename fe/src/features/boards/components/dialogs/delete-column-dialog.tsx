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
import { deleteColumn } from "@/features/boards/boardDetailSlide";
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
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteColumn(columnId)).unwrap();
      addToast(t("list_deleted_success", { title: columnTitle }), "success");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast(t("delete_list_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("delete_list_confirm_title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_list_confirm_desc", { title: columnTitle })}
            {taskCount > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                {t("delete_list_cards_warning", { count: taskCount })}
              </span>
            )}
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
              t("delete_list")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
