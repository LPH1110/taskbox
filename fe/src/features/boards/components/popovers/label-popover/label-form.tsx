import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABEL_COLORS } from "./constants";

interface LabelFormProps {
  mode: "create" | "edit";
  titleInput: string;
  setTitleInput: (val: string) => void;
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  setIsDeleteDialogOpen: (val: boolean) => void;
  handleUpdate: () => void;
  handleCreate: () => void;
}

export function LabelForm({
  mode,
  titleInput,
  setTitleInput,
  selectedColor,
  setSelectedColor,
  setIsDeleteDialogOpen,
  handleUpdate,
  handleCreate
}: LabelFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Preview Box */}
      <div
        className="h-24 rounded flex items-center justify-center text-white font-semibold text-xl shadow-inner"
        style={{ backgroundColor: selectedColor }}
      >
        {titleInput || "Title..."}
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-muted-foreground">
          Title
        </span>
        <Input
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-muted-foreground">
          Select a color
        </span>
        <div className="grid grid-cols-5 gap-2">
          {LABEL_COLORS.map((c) => (
            <div
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              className={cn(
                "h-8 rounded cursor-pointer hover:opacity-80 transition-all",
                selectedColor === c.value &&
                  "ring-2 ring-offset-1 ring-ring scale-105"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 gap-2">
        {mode === "edit" ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleUpdate}
            >
              Save
            </Button>
          </>
        ) : (
          <Button size="sm" className="w-full" onClick={handleCreate}>
            Create
          </Button>
        )}
      </div>
    </div>
  );
}
