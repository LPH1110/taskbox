import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Check, Tag } from "lucide-react";
import { useState } from "react";
import { createLabel, toggleTaskLabel } from "../boardDetailSlide";

const LABEL_COLORS = [
  { name: "Green", value: "#4bce97" },
  { name: "Yellow", value: "#f5cd47" },
  { name: "Orange", value: "#fea362" },
  { name: "Red", value: "#f87168" },
  { name: "Purple", value: "#9f8fef" },
  { name: "Blue", value: "#579dff" },
];

interface LabelPopoverProps {
  taskId: string;
}

export function LabelPopover({ taskId }: LabelPopoverProps) {
  const dispatch = useAppDispatch();
  const { labels, currentBoard, tasks } = useAppSelector(
    (state) => state.boardDetail
  );
  const task = tasks[taskId];

  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);

  const taskLabelIds = task?.labelIds || [];

  const filteredLabels = Object.values(labels).filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (labelId: string) => {
    const isActive = taskLabelIds.includes(labelId);
    dispatch(toggleTaskLabel({ taskId, labelId, isAdding: !isActive }));
  };

  const handleCreate = async () => {
    if (!newLabelTitle.trim() || !currentBoard) return;
    try {
      await dispatch(
        createLabel({
          boardId: currentBoard.id,
          title: newLabelTitle,
          color: selectedColor,
        })
      ).unwrap();
      // Reset form
      setIsCreating(false);
      setNewLabelTitle("");
      setSearch("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("Failed to create label");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="w-full justify-start h-8 text-sm"
        >
          <Tag className="mr-2 h-4 w-4" /> Labels
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="font-medium text-center text-sm pb-2 border-b">
            {isCreating ? "Create label" : "Labels"}
          </div>

          {isCreating ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              {/* Preview */}
              <div
                className="h-8 rounded text-sm font-medium text-white/80 flex items-center px-3 mb-2"
                style={{ backgroundColor: selectedColor }}
              >
                {newLabelTitle || "Title..."}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Title
                </span>
                <Input
                  value={newLabelTitle}
                  onChange={(e) => setNewLabelTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Select a color
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {LABEL_COLORS.map((c) => (
                    <div
                      key={c.value}
                      onClick={() => setSelectedColor(c.value)}
                      className={cn(
                        "h-8 rounded cursor-pointer hover:opacity-80 transition-all",
                        selectedColor === c.value &&
                          "ring-2 ring-offset-1 ring-ring"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Back
                </Button>
                <Button size="sm" onClick={handleCreate}>
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search labels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredLabels.map((label) => {
                  const isActive = taskLabelIds.includes(label.id);
                  return (
                    <div key={label.id} className="flex items-center gap-2">
                      <div
                        className="flex-1 h-8 rounded text-white/80 text-sm font-medium px-2 flex items-center cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: label.color }}
                        onClick={() => handleToggle(label.id)}
                      >
                        {label.title}
                        {isActive && <Check className="ml-auto h-4 w-4" />}
                      </div>
                    </div>
                  );
                })}
                {filteredLabels.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No labels found.
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                className="w-full h-8 text-xs bg-muted/50 hover:bg-muted"
                onClick={() => setIsCreating(true)}
              >
                Create a new label
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
