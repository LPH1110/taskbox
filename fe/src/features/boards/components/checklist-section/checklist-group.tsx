import { CheckSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import type { Checklist } from "../../types/board-detail";
import { deleteChecklist, updateChecklist, createChecklistItem } from "../../boardDetailSlide";
import { InlineEditable } from "@/components/ui/inline-editable";
import { ChecklistItemRow } from "./checklist-item-row";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function ChecklistGroup({ checklist, taskId }: { checklist: Checklist, taskId: string }) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const [newItemContent, setNewItemContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = checklist.items.filter(i => i.is_completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleTitleSave = async (newTitle: string) => {
    if (newTitle.trim() && newTitle !== checklist.title) {
      await dispatch(updateChecklist({ checklistId: checklist.id, title: newTitle }));
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteChecklist({ taskId, checklistId: checklist.id }));
  };

  const handleAddItem = async () => {
    if (newItemContent.trim()) {
      await dispatch(createChecklistItem({ checklistId: checklist.id, content: newItemContent }));
      setNewItemContent("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex gap-4">
      <CheckSquare className="mt-0.5 h-6 w-6 text-muted-foreground shrink-0" />
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base flex-1">
            <InlineEditable
              value={checklist.title}
              onSave={handleTitleSave}
              className="text-base font-semibold"
            />
          </h3>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">{progress}%</span>
          <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className={`h-full bg-primary transition-all duration-300 ${progress === 100 ? "bg-green-500" : ""}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {checklist.items.map(item => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* Add Item Form */}
        {!isAdding ? (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsAdding(true)}>
            {t("add_an_item", "Add an item")}
          </Button>
        ) : (
          <div className="space-y-2">
            <Input 
              value={newItemContent} 
              onChange={e => setNewItemContent(e.target.value)} 
              placeholder={t("add_an_item", "Add an item")}
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") setIsAdding(false);
              }}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleAddItem}>{t("add", "Add")}</Button>
              <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>{t("cancel", "Cancel")}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
