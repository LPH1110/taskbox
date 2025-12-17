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
import { useState } from "react";
import { addMember } from "../boardDetailSlide";
import type { BoardMember } from "../types";
import { DeleteMemberDialog } from "./delete-member-dialog";

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

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(
    null
  );

  // Determine if current user is Admin
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === "admin";

  const handleInvite = async () => {
    if (!email.trim() || !currentBoard) return;
    setLoading(true);
    try {
      await dispatch(
        addMember({ boardId: currentBoard.id, email: email.trim() })
      ).unwrap();
      addToast("Member added successfully", "success");
      setEmail(""); // Clear input
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addToast(error || "Failed to add member", "error");
    } finally {
      setLoading(false);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
            <DialogDescription>
              Invite team members to collaborate on this board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Invite Section */}
            <div className="flex gap-2">
              <Input
                placeholder="Email address (e.g., user@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <Button onClick={handleInvite} disabled={loading || !email}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
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
