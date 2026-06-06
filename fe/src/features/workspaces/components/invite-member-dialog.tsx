import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { createWorkspaceInvitation } from "../workspacesSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InviteMemberDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
  currentUserRole?: "owner" | "admin" | "member";
}

export function InviteMemberDialog({ workspaceId, trigger, currentUserRole }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(["workspaces"]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(createWorkspaceInvitation({ workspaceId, email: email.trim(), role })).unwrap();
      addToast("Invitation email sent successfully", "success");
      setEmail("");
      setRole("member");
      setOpen(false);
    } catch (err: any) {
      addToast(err || "Failed to invite member", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = currentUserRole === "owner";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="shadow-xs gap-2">
            <UserPlus className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Invite Workspace Member
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. member@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Workspace Role
            </Label>
            <Select value={role} onValueChange={(val: "admin" | "member") => setRole(val)}>
              <SelectTrigger id="role" className="w-full !h-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{t("workspaces:member")}</span>
                    <span className="text-xs text-muted-foreground">Can view and create boards.</span>
                  </div>
                </SelectItem>
                {isOwner && (
                  <SelectItem value="admin">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{t("workspaces:admin")}</span>
                      <span className="text-xs text-muted-foreground">Can invite/remove members and manage settings.</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("workspaces:cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
