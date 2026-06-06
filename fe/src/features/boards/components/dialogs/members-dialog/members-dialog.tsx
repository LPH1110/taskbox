/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { fetchWorkspaceMembers } from "../../../../workspaces/workspacesSlice";
import { addMember } from "../../../boardDetailSlide";
import type { BoardMember } from "../../../types";
import { DeleteMemberDialog } from "../delete-member-dialog";
import { MemberList } from "./member-list";
import { MemberPicker } from "./member-picker";

interface MembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembersDialog({ isOpen, onClose }: MembersDialogProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { members, currentBoard } = useAppSelector(
    (state) => state.boardDetail
  );
  const workspaceMembers = useAppSelector((state) => state.workspaces.members);

  const [searchQuery, setSearchQuery] = useState("");
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(
    null
  );

  // Fetch workspace members when dialog opens
  useEffect(() => {
    if (isOpen && currentBoard?.workspace_id) {
      dispatch(fetchWorkspaceMembers(currentBoard.workspace_id));
    }
  }, [isOpen, currentBoard?.workspace_id, dispatch]);

  // Determine if current user is Admin
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === "admin";

  const handleAddWorkspaceMember = async (targetUserId: string) => {
    if (!currentBoard) return;
    setAddingUserId(targetUserId);
    try {
      await dispatch(
        addMember({ boardId: currentBoard.id, userId: targetUserId })
      ).unwrap();
      addToast(t("member_added_success"), "success");
    } catch (error: any) {
      addToast(error || t("member_added_failed"), "error");
    } finally {
      setAddingUserId(null);
    }
  };

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get addable workspace members not already on this board (and not the owner)
  const addableWorkspaceMembers = workspaceMembers.filter((wsMember) => {
    const isOwner = currentBoard?.owner_id === wsMember.user_id;
    const isAlreadyMember = members.some((m) => m.user_id === wsMember.user_id);
    if (isOwner || isAlreadyMember) return false;

    const query = searchQuery.toLowerCase();
    const fullName = wsMember.profiles.full_name?.toLowerCase() || "";
    const email = wsMember.profiles.email.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("share_board")}</DialogTitle>
            <DialogDescription>
              {t("invite_team_members_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Workspace Member Picker */}
            <MemberPicker
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              addableWorkspaceMembers={addableWorkspaceMembers}
              handleAddWorkspaceMember={handleAddWorkspaceMember}
              addingUserId={addingUserId}
              getInitials={getInitials}
            />

            {/* Members List */}
            <MemberList
              members={members}
              user={user}
              isAdmin={!!isAdmin}
              getInitials={getInitials}
              setMemberToRemove={setMemberToRemove}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      {currentBoard && (
        <DeleteMemberDialog
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          member={memberToRemove}
          boardId={currentBoard.id}
        />
      )}
    </>
  );
}
