import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { GithubIcon as Github } from "@/components/icons/github-icon";
import { api } from "@/lib/api";

interface GithubRepoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export function GithubRepoDialog({ isOpen, onClose, boardId }: GithubRepoDialogProps) {
  const { t } = useTranslation(["boards"]);
  const { currentBoard } = useAppSelector((state) => state.boardDetail);
  const [repoName, setRepoName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && currentBoard) {
      setRepoName(currentBoard.github_repo_full_name || "");
    }
  }, [isOpen, currentBoard]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // We haven't added this to Redux thunks yet, so let's hit the API directly
      // since it's a simple PATCH and we rely on sockets for real-time board update anyway.
      await api.patch(`/boards/${boardId}/github`, {
        github_repo_full_name: repoName.trim() || null,
      });
      addToast(t("github_repo_linked"), "success");
      onClose();
    } catch (error: any) {
      addToast(error.message || t("github_repo_link_failed"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {t("link_github_repo")}
          </DialogTitle>
          <DialogDescription>
            {t("link_github_repo_desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="repo" className="text-sm font-medium">
              {t("repo_full_name")}
            </label>
            <Input
              id="repo"
              placeholder="e.g. facebook/react"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("repo_format")} <code>owner/repository</code>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("save") + "..." : t("save_linkage")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
