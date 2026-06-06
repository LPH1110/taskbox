import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { createColumn } from "../boardDetailSlide";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AddColumnForm = () => {
  const { t } = useTranslation(["boards"]);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const dispatch = useAppDispatch();
  const { boardId } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !boardId) return;

    await dispatch(createColumn({ boardId, title }));
    setTitle("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-72 shrink-0 rounded-xl bg-background/95 p-3 border border-black/10 dark:border-white/10 shadow-lg h-fit">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoFocus
            placeholder={t("enter_list_title_placeholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50 border-black/10 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="shadow-sm">
              {t("add_list")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-72 shrink-0 rounded-xl bg-background/30 backdrop-blur-sm border border-black/10 dark:border-white/5 p-3 flex items-center justify-start cursor-pointer hover:bg-background/50 transition-colors shadow-sm h-12"
    >
      <span className="text-foreground drop-shadow-sm text-sm font-medium flex items-center gap-2 pl-2">
        <Plus className="h-4 w-4" /> {t("add_another_list")}
      </span>
    </div>
  );
};
