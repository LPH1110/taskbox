import { AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { type Task } from "../../types/board-detail";

interface DescriptionProps {
  task: Task;
  description: string;
  setDescription: (val: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (val: boolean) => void;
  handleSaveDescription: () => void;
  handleCancelDescription: () => void;
}

export function Description({
  task,
  description,
  setDescription,
  isEditingDescription,
  setIsEditingDescription,
  handleSaveDescription,
  handleCancelDescription
}: DescriptionProps) {
  return (
    <div className="flex gap-4">
      <AlignLeft className="mt-0.5 h-6 w-6 text-muted-foreground shrink-0" />
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Description</h3>
          {!isEditingDescription && task.description && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)} className="h-8 text-xs font-medium bg-muted/30">
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div
            className={`rounded-md transition-all duration-300 ease-in-out border ${!isEditingDescription
              ? "bg-muted/10 border-transparent hover:bg-muted/30 hover:border-border/50 cursor-text"
              : "border-transparent"
              }`}
            onClick={() => {
              if (!isEditingDescription) setIsEditingDescription(true);
            }}
          >
            {!isEditingDescription && (!description || description === '<p></p>') ? (
              <div className="p-4 text-sm text-muted-foreground/70 min-h-[80px]">
                Add a more detailed description...
              </div>
            ) : (
              <TiptapEditor
                content={description}
                onUpdate={setDescription}
                editable={isEditingDescription}
              />
            )}
          </div>

          {isEditingDescription && (
            <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Button size="sm" onClick={handleSaveDescription}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelDescription}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
