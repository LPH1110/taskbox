import type { ChecklistItem } from "../../types/board-detail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateChecklistItem, deleteChecklistItem } from "../../boardDetailSlide";
import { InlineEditable } from "@/components/ui/inline-editable";
import { Button } from "@/components/ui/button";
import { Trash2, User, Calendar } from "lucide-react";
import { motion } from "motion/react";

export function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const dispatch = useAppDispatch();
  const members = useAppSelector(state => state.boardDetail.members);

  const handleToggle = async () => {
    await dispatch(updateChecklistItem({ itemId: item.id, updates: { is_completed: !item.is_completed } }));
  };

  const handleContentSave = async (content: string) => {
    if (content.trim() && content !== item.content) {
      await dispatch(updateChecklistItem({ itemId: item.id, updates: { content } }));
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteChecklistItem(item.id));
  };

  const assignee = members.find(m => m.user_id === item.assignee_id);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.2, layout: { duration: 0.2 } }}
      className="group flex items-start gap-3 rounded-md p-1 hover:bg-muted/50 transition-colors"
    >
      <div className="pt-1 flex-shrink-0">
        <label htmlFor={`check-item-${item.id}`} className="sr-only">Toggle completed status</label>
        <input 
          type="checkbox" 
          id={`check-item-${item.id}`}
          checked={item.is_completed} 
          onChange={handleToggle}
          className="h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary cursor-pointer accent-primary"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <InlineEditable
          value={item.content}
          onSave={handleContentSave}
          className={`text-sm ${item.is_completed ? "line-through text-muted-foreground" : ""}`}
        />
        <div className="flex items-center gap-2 mt-1">
           {assignee && (
             <div className="flex items-center gap-1 text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
               <User className="h-3 w-3" />
               {assignee.profiles?.full_name}
             </div>
           )}
           {item.due_date && (
             <div className="flex items-center gap-1 text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
               <Calendar className="h-3 w-3" />
               {new Date(item.due_date).toLocaleDateString()}
             </div>
           )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
        onClick={handleDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </motion.div>
  );
}
