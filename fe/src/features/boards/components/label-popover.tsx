import { useState } from "react";
import { Check, ChevronLeft, Pencil, Tag, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createLabel,
  toggleTaskLabel,
  updateLabel,
  deleteLabel,
} from "../boardDetailSlide";
import { cn } from "@/lib/utils";
import { type Label } from "../types/board-detail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const taskLabelIds = task?.labelIds || [];

  const [isOpen, setIsOpen] = useState(false);

  // View State
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");

  // Form State
  const [search, setSearch] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // -- Helpers --
  const resetForm = () => {
    setMode("list");
    setTitleInput("");
    setEditingLabelId(null);
    setSelectedColor(LABEL_COLORS[0].value);
  };

  const startCreate = () => {
    setMode("create");
    setTitleInput("");
    setSelectedColor(LABEL_COLORS[0].value);
  };

  const startEdit = (label: Label) => {
    setMode("edit");
    setEditingLabelId(label.id);
    setTitleInput(label.title);
    setSelectedColor(label.color);
  };

  // -- Handlers --
  const handleToggle = (labelId: string) => {
    const isActive = taskLabelIds.includes(labelId);
    dispatch(toggleTaskLabel({ taskId, labelId, isAdding: !isActive }));
  };

  const handleCreate = async () => {
    if (!titleInput.trim() || !currentBoard) return;
    await dispatch(
      createLabel({
        boardId: currentBoard.id,
        title: titleInput,
        color: selectedColor,
      })
    ).unwrap();
    resetForm();
  };

  const handleUpdate = async () => {
    if (!titleInput.trim() || !editingLabelId) return;
    await dispatch(
      updateLabel({
        labelId: editingLabelId,
        title: titleInput,
        color: selectedColor,
      })
    ).unwrap();
    resetForm();
  };

  const handleDelete = async () => {
    if (!editingLabelId) return;
    await dispatch(deleteLabel(editingLabelId)).unwrap();
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const filteredLabels = Object.values(labels).filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* 1. Main Popover */}
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start h-8 text-sm"
          >
            <Tag className="mr-2 h-4 w-4" /> Labels
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 overflow-hidden" align="start">
          {/* Header */}
          <div className="relative p-3 text-center border-b grid grid-cols-3 items-center">
            {mode !== "list" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute left-3"
                onClick={resetForm}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="font-semibold text-sm col-start-2">
              {mode === "list" && "Labels"}
              {mode === "create" && "Create label"}
              {mode === "edit" && "Edit label"}
            </span>
          </div>

          <div className="p-3">
            {/* --- VIEW: LIST --- */}
            {mode === "list" && (
              <>
                <Input
                  placeholder="Search labels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 mb-3"
                  autoFocus
                />

                <div className="space-y-1 max-h-64 overflow-y-auto mb-3">
                  <span className="text-xs font-semibold text-muted-foreground block mb-2">
                    Labels
                  </span>
                  {filteredLabels.map((label) => {
                    const isActive = taskLabelIds.includes(label.id);
                    return (
                      <div
                        key={label.id}
                        className="flex items-center gap-2 group"
                      >
                        <div
                          className="flex-1 h-8 rounded text-white text-sm font-medium px-3 flex items-center cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: label.color }}
                          onClick={() => handleToggle(label.id)}
                        >
                          <span className="truncate">{label.title}</span>
                          {isActive && (
                            <Check className="ml-auto h-4 w-4 shrink-0" />
                          )}
                        </div>
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(label);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  className="w-full h-8 text-sm bg-muted/50 hover:bg-muted"
                  onClick={startCreate}
                >
                  Create a new label
                </Button>
              </>
            )}

            {/* --- VIEW: CREATE & EDIT (Shared Form) --- */}
            {(mode === "create" || mode === "edit") && (
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
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* 2. Alert Dialog  */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete label?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this label and remove it from all
              cards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
