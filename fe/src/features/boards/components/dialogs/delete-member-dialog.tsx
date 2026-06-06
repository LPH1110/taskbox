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
import { useToast } from "@/context/ToastContext";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";
import { removeMember } from "@/features/boards/boardDetailSlide";
import { type BoardMember } from "@/features/boards/types";

interface DeleteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: BoardMember | null;
  boardId: string;
}

export function DeleteMemberDialog({
  isOpen,
  onClose,
  member,
  boardId,
}: DeleteMemberDialogProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!member) return null;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from closing immediately
    setLoading(true);

    try {
      await dispatch(
        removeMember({ boardId, userId: member.user_id })
      ).unwrap();

      addToast(t("member_removed_success"), "success");
      onClose(); // Close dialog on success
    } catch (error) {
      addToast(t("member_removed_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("remove_member_confirm_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("remove_member_confirm_desc", { name: member.profiles?.full_name || t("unknown_user") })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={loading}
          >
            {loading ? t("removing") : t("remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
