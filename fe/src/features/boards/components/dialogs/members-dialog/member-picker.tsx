import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface MemberPickerProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  addableWorkspaceMembers: any[];
  handleAddWorkspaceMember: (targetUserId: string) => void;
  addingUserId: string | null;
  getInitials: (name?: string) => string;
}

export function MemberPicker({
  searchQuery,
  setSearchQuery,
  addableWorkspaceMembers,
  handleAddWorkspaceMember,
  addingUserId,
  getInitials
}: MemberPickerProps) {
  return (
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
                    <AvatarImage src={wsMember.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-3xs bg-primary/10 text-primary">
                      {getInitials(wsMember.profiles?.full_name || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium truncate">
                      {wsMember.profiles?.full_name || "Unknown User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {wsMember.profiles?.email}
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
  );
}
