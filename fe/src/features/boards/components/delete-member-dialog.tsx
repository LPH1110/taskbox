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
import { useToast } from "@/context/ToastContext";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";
import { removeMember } from "../boardDetailSlide";
import { type BoardMember } from "../types";

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

      addToast("Member removed from board", "success");
      onClose(); // Close dialog on success
    } catch (error) {
      addToast("Failed to remove member", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {member.profiles?.full_name || "this user"}
            </span>{" "}
            from the board? They will lose access to all lists and cards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
