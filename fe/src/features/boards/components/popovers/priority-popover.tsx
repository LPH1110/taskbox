import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateTask } from "../../boardDetailSlide";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PriorityPopoverProps {
  taskId: string;
  children?: React.ReactNode;
}

const priorities = [
  { value: "high", label: "High", color: "destructive" as const },
  { value: "medium", label: "Medium", color: "default" as const },
  { value: "low", label: "Low", color: "secondary" as const },
  { value: "none", label: "None", color: "outline" as const },
];

export function PriorityPopover({ taskId, children }: PriorityPopoverProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const tasks = useAppSelector((state) => state.boardDetail.tasks);
  const task = tasks[taskId];

  if (!task) return null;

  const currentPriority = task.priority || "none";

  const handleSelect = async (priorityValue: string) => {
    const newPriority = priorityValue === "none" ? null : priorityValue;
    if (task.priority === newPriority) return;
    
    try {
      await dispatch(
        updateTask({ taskId, updates: { priority: newPriority as any } })
      ).unwrap();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update priority", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="secondary"
            className="w-full justify-start h-8 text-sm hover:bg-accent"
          >
            <Flag className="mr-2 h-4 w-4" /> {t("priority")}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="start" side="bottom">
        <h4 className="font-semibold text-sm mb-3 text-center text-muted-foreground">{t("change_priority")}</h4>
        <div className="space-y-1">
          {priorities.map((p) => {
            const isSelected = currentPriority === p.value;
            return (
              <div
                key={p.value}
                onClick={() => handleSelect(p.value)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant={p.color} className="w-full justify-center">
                    {t(`priority_${p.value}`)}
                  </Badge>
                </div>
                <div className="w-6 flex justify-end">
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
