import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Shield, User, UserX } from "lucide-react";
import type { BoardMember } from "@/features/boards/types";

interface MemberListProps {
  members: BoardMember[];
  user: { id: string } | null;
  isAdmin: boolean;
  getInitials: (name?: string) => string;
  setMemberToRemove: (member: BoardMember) => void;
}

export function MemberList({
  members,
  user,
  isAdmin,
  getInitials,
  setMemberToRemove
}: MemberListProps) {
  const { t } = useTranslation(["boards"]);
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        {t("board_members_count", { count: members.length })}
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
                      {member.profiles?.full_name || t("unknown_user")}
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
                      {/* Remove Item: Only show if NOT Self */}
                      {!isSelf && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          onSelect={() => setMemberToRemove(member)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          {t("remove_from_board")}
                        </DropdownMenuItem>
                      )}

                      {/* Optional: Show 'Leave Board' if it IS Self */}
                      {isSelf && (
                        <DropdownMenuItem
                          disabled
                          className="opacity-50"
                        >
                          {t("cannot_remove_self")}
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
  );
}
