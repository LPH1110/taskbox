import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import {
  fetchWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  fetchWorkspaceInvitations,
  cancelWorkspaceInvitation,
} from "../workspacesSlice";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Search,
  UserMinus,
  LogOut,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";

interface MembersTabProps {
  workspaceId: string;
}

export function MembersTab({ workspaceId }: MembersTabProps) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const members = useAppSelector((state) => state.workspaces.members);
  const isMembersLoading = useAppSelector((state) => state.workspaces.isMembersLoading);
  const invitations = useAppSelector((state) => state.workspaces.invitations);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; isSelf: boolean } | null>(null);

  // Find current user's role in this workspace
  const currentMember = members.find((m) => m.user_id === currentUser?.id);
  const currentUserRole = currentMember?.role; // "owner" | "admin" | "member"

  useEffect(() => {
    dispatch(fetchWorkspaceMembers(workspaceId));
    if (currentUserRole === "owner" || currentUserRole === "admin") {
      dispatch(fetchWorkspaceInvitations(workspaceId));
    }
  }, [dispatch, workspaceId, currentUserRole]);

  const handleRoleChange = async (targetUserId: string, newRole: "admin" | "member") => {
    try {
      await dispatch(
        updateWorkspaceMemberRole({ workspaceId, userId: targetUserId, role: newRole })
      ).unwrap();
      addToast("Role updated successfully", "success");
    } catch (err: any) {
      addToast(err || "Failed to update role", "error");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      try {
        await dispatch(cancelWorkspaceInvitation({ workspaceId, invitationId })).unwrap();
        addToast("Invitation cancelled successfully", "success");
      } catch (err: any) {
        addToast(err || "Failed to cancel invitation", "error");
      }
    }
  };

  const handleRemoveMember = (targetUserId: string, isSelf: boolean) => {
    setMemberToRemove({ userId: targetUserId, isSelf });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    const { userId, isSelf } = memberToRemove;
    setMemberToRemove(null);

    try {
      await dispatch(removeWorkspaceMember({ workspaceId, userId })).unwrap();
      addToast(
        isSelf ? "You left the workspace" : "Member removed successfully",
        "success"
      );
    } catch (err: any) {
      addToast(err || "Failed to remove member", "error");
    }
  };

  const filteredMembers = members.filter((member) => {
    const fullName = member.profiles.full_name?.toLowerCase() || "";
    const email = member.profiles.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Member
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <InviteMemberDialog
            workspaceId={workspaceId}
            currentUserRole={currentUserRole}
          />
        )}
      </div>

      {isMembersLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-input/10 rounded-lg border border-input/20">
          <p className="text-muted-foreground">No members found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-input/20 overflow-hidden bg-background/50 backdrop-blur-md">
          <div className="divide-y divide-input/20">
            {filteredMembers.map((member) => {
              const isSelf = member.user_id === currentUser?.id;
              const isOwner = member.role === "owner";
              const isAdmin = member.role === "admin";

              // Can current user change the role of this member?
              // Only Owner can manage admin/member roles, and cannot change owner role.
              const canManageRole = currentUserRole === "owner" && !isOwner;

              // Can current user remove this member?
              // 1. Owner can remove anyone except themselves
              // 2. Admin can remove normal members (not owners or admins)
              // 3. Anyone can remove themselves (self-leave, unless owner)
              const canRemove =
                (isSelf && !isOwner) ||
                (currentUserRole === "owner" && !isSelf) ||
                (currentUserRole === "admin" && !isOwner && !isAdmin && !isSelf);

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-4 flex-wrap gap-4 sm:flex-nowrap"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-input/30">
                      <AvatarImage
                        src={member.profiles.avatar_url || ""}
                        alt={member.profiles.full_name || ""}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(member.profiles.full_name || member.profiles.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {member.profiles.full_name || "Unnamed User"}
                        </span>
                        {isSelf && (
                          <Badge variant="secondary" className="text-2xs py-0 px-1">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block">
                        {member.profiles.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto sm:ml-0">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      {canManageRole ? (
                        <Select
                          value={member.role as "admin" | "member"}
                          onValueChange={(val: "admin" | "member") =>
                            handleRoleChange(member.user_id, val)
                          }
                        >
                          <SelectTrigger className="h-8 w-28 bg-transparent border-input/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                    </div>

                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.user_id, isSelf)}
                        className={`h-8 w-8 hover:bg-destructive/10 ${
                          isSelf ? "text-amber-500 hover:text-amber-600" : "text-destructive hover:text-destructive"
                        }`}
                        title={isSelf ? "Leave Workspace" : "Remove Member"}
                      >
                        {isSelf ? (
                          <LogOut className="h-4 w-4" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Invitations Section */}
      {(currentUserRole === "owner" || currentUserRole === "admin") && invitations.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="border-t border-input/20 pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Pending Invitations ({invitations.filter(i => i.status === "pending" || i.status === "expired").length})
            </h3>
            <div className="rounded-lg border border-input/20 overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="divide-y divide-input/20">
                {invitations
                  .filter((inv) => inv.status === "pending" || inv.status === "expired")
                  .map((inv) => {
                    const isExpired = inv.status === "expired" || new Date() > new Date(inv.expires_at);
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-4 flex-wrap gap-4 sm:flex-nowrap"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-input/30">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              @
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {inv.email}
                              </span>
                              {isExpired ? (
                                <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                                  Expired
                                </Badge>
                              ) : (
                                <Badge className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20">
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground block">
                              Invited as {inv.role} • Expires on {new Date(inv.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto sm:ml-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(inv.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                          >
                            Cancel Invite
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Member Removal */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.isSelf 
                ? "You will leave this workspace and lose access to all its boards. This action cannot be undone."
                : "This member will be removed from the workspace and lose access to all its boards. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {memberToRemove?.isSelf ? "Leave Workspace" : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
