import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppSelector } from "@/store/hooks";
import { UserMinus } from "lucide-react";
import { useState } from "react";
import { type BoardMember } from "../types";
import { DeleteMemberDialog } from "./delete-member-dialog";

interface MemberPopoverProps {
  member: BoardMember;
  boardId: string;
}

export function MemberPopover({ member, boardId }: MemberPopoverProps) {
  // State for Popover and Alert Dialog
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Permission Check
  const { user } = useAppSelector((state) => state.auth);
  const { members } = useAppSelector((state) => state.boardDetail);

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === "admin";
  const isSelf = user?.id === member.user_id;

  // Initials for Avatar Fallback
  const initials = member.profiles?.full_name
    ? member.profiles.full_name.charAt(0).toUpperCase()
    : "U";

  const handleRemoveClick = () => {
    setIsPopoverOpen(false); // Close the small popover first
    setIsAlertOpen(true); // Open the big warning dialog
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="cursor-pointer transition-transform hover:scale-105">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={member.profiles?.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profiles?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-sm truncate">
                  {member.profiles?.full_name || "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {member.profiles?.email}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Only Admin can see this button, and cannot remove self */}
            {isAdmin && !isSelf && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={handleRemoveClick}
              >
                <UserMinus className="mr-2 h-3 w-3" />
                Remove from board
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirmation Dialog */}
      <DeleteMemberDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        member={member}
        boardId={boardId}
      />
    </>
  );
}
