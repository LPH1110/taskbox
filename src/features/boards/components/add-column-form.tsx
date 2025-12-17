import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { createColumn } from "../boardDetailSlide";
import { useParams } from "react-router-dom";

export const AddColumnForm = () => {
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
      <div className="w-70 shrink-0 rounded-xl bg-muted/50 p-2 border shadow-sm h-fit">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            autoFocus
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
          <div className="flex items-center gap-1">
            <Button type="submit" size="sm">
              Add List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
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
      className="w-70 shrink-0 rounded-xl bg-muted/30 border border-dashed p-3 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-[100px]"
    >
      <span className="text-muted-foreground text-sm font-medium flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add another list
      </span>
    </div>
  );
};
