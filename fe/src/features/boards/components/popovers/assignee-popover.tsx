import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { User, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTaskAssignee } from "../../boardDetailSlide";
import { useState } from "react";

interface AssigneePopoverProps {
  taskId: string;
  children?: React.ReactNode;
}

export function AssigneePopover({ taskId, children }: AssigneePopoverProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const members = useAppSelector((state) => state.boardDetail.members);
  const tasks = useAppSelector((state) => state.boardDetail.tasks);

  const task = tasks[taskId];
  if (!task) return null;

  const assigneeIds = task.assigneeIds || [];

  const handleToggle = async (userId: string) => {
    const isAdding = !assigneeIds.includes(userId);
    try {
      await dispatch(
        toggleTaskAssignee({ taskId, userId, isAdding })
      ).unwrap();
    } catch (error) {
      console.error("Failed to toggle assignee", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="secondary"
            className="w-full justify-start h-8 text-sm"
          >
            <User className="mr-2 h-4 w-4" /> Members
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="bottom">
        <h4 className="font-semibold text-sm mb-3 text-center">Assign Members</h4>
        <div className="space-y-2">
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No board members found.
            </p>
          )}
          {members.map((member) => {
            const isAssigned = assigneeIds.includes(member.user_id);
            const profile = member.profiles;
            const fallback = profile?.full_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || "U";

            return (
              <div
                key={member.user_id}
                onClick={() => handleToggle(member.user_id)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-[10px]">{fallback}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">
                    {profile?.full_name || profile?.email}
                  </span>
                </div>
                {isAssigned && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
