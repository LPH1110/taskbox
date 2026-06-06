import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";
import { createWorkspace } from "../workspacesSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateWorkspaceDialogProps {
  trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({ trigger }: CreateWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { items: workspaces } = useAppSelector((state) => state.workspaces);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(["workspaces"]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const duplicateWorkspace = workspaces.find((w) => w.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicateWorkspace) {
      addToast(t("duplicate_name_error"), "error");
      return;
    }

    setIsLoading(true);
    try {
      const workspace = await dispatch(createWorkspace({ name, description })).unwrap();
      setName("");
      setDescription("");
      setOpen(false);
      if (workspace && workspace.id) {
        navigate(`/workspaces/${workspace.id}`);
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> {t("create_workspace_btn")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("new_workspace_title")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t("workspace_name_label")}
            </Label>
            <Input
              id="name"
              placeholder={t("workspace_name_placeholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("workspace_desc_label")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("workspace_desc_placeholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? t("creating_btn") : t("create_btn")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
