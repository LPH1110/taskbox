/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/context/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChevronDown, Loader2, Shield, User, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { addMember } from "../boardDetailSlide";
import type { BoardMember } from "../types";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { fetchWorkspaceMembers } from "../../workspaces/workspacesSlice";

interface MembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembersDialog({ isOpen, onClose }: MembersDialogProps) {
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
      addToast("Member added to board successfully", "success");
    } catch (error: any) {
      addToast(error || "Failed to add member", "error");
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
            <DialogTitle>Share Board</DialogTitle>
            <DialogDescription>
              Invite team members to collaborate on this board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Workspace Member Picker */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Add members from Workspace
              </h4>
              <Input
                placeholder="Search workspace members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-input/30"
              />
              <ScrollArea className="h-32 border border-input/20 rounded-md p-2 bg-muted/10">
                {addableWorkspaceMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {searchQuery ? "No matching workspace members" : "All workspace members are on this board"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {addableWorkspaceMembers.map((wsMember) => (
                      <div
                        key={wsMember.user_id}
                        className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <Avatar className="h-7 w-7 border border-input/20">
                            <AvatarImage src={wsMember.profiles.avatar_url || undefined} />
                            <AvatarFallback className="text-3xs bg-primary/10 text-primary">
                              {getInitials(wsMember.profiles.full_name || undefined)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium truncate">
                              {wsMember.profiles.full_name || "Unknown User"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {wsMember.profiles.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-3 shadow-none shrink-0"
                          onClick={() => handleAddWorkspaceMember(wsMember.user_id)}
                          disabled={addingUserId !== null}
                        >
                          {addingUserId === wsMember.user_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Board Members ({members.length})
              </h4>
              <ScrollArea className="h-50 pr-4">
                <div className="space-y-3">
                  {members.map((member) => {
                    const isSelf = user?.id === member.user_id;
                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.profiles?.avatar_url} />
                            <AvatarFallback>
                              {getInitials(member.profiles?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {member.profiles?.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {member.profiles?.email}
                            </p>
                          </div>
                        </div>

                        {/* Role Badge */}
                        {!isAdmin ? (
                          <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded gap-1">
                            {member.role === "admin" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span className="capitalize">{member.role}</span>
                          </div>
                        ) : (
                          // If Admin, show Dropdown (Interactive)
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-auto py-1 px-2 text-xs hover:bg-muted bg-muted/50 border border-transparent hover:border-border gap-1"
                                // Optional: Disable dropdown trigger entirely for self if you don't want to allow changing own role/leaving here
                                // disabled={isSelf}
                              >
                                {member.role === "admin" ? (
                                  <Shield className="w-3 h-3 text-primary" />
                                ) : (
                                  <User className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="capitalize">
                                  {member.role}
                                </span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* TODO: Add 'Change to Admin/Member' items here later */}

                              {/* Remove Item: Only show if NOT Self */}
                              {!isSelf && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                  onSelect={() => setMemberToRemove(member)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove from board
                                </DropdownMenuItem>
                              )}

                              {/* Optional: Show 'Leave Board' if it IS Self */}
                              {isSelf && (
                                <DropdownMenuItem
                                  disabled
                                  className="opacity-50"
                                >
                                  You cannot remove yourself
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
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
