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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChevronLeft, Tag } from "lucide-react";
import { useState } from "react";
import {
  createLabel,
  deleteLabel,
  toggleTaskLabel,
  updateLabel,
} from "../../../boardDetailSlide";
import { type Label } from "../../../types/board-detail";

import { LABEL_COLORS } from "./constants";
import { LabelForm } from "./label-form";
import { LabelList } from "./label-list";


interface LabelPopoverProps {
  taskId: string;
}

export function LabelPopover({ taskId }: LabelPopoverProps) {
  const { t } = useTranslation(["boards"]);
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
            <Tag className="mr-2 h-4 w-4" /> {t("label_popover_button")}
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
              {mode === "list" && t("label_popover_title")}
              {mode === "create" && t("create_label")}
              {mode === "edit" && t("edit_label")}
            </span>
          </div>

          <div className="p-3">
            {/* --- VIEW: LIST --- */}
            {mode === "list" && (
              <LabelList
                search={search}
                setSearch={setSearch}
                filteredLabels={filteredLabels}
                taskLabelIds={taskLabelIds}
                handleToggle={handleToggle}
                startEdit={startEdit}
                startCreate={startCreate}
              />
            )}

            {/* --- VIEW: CREATE & EDIT (Shared Form) --- */}
            {(mode === "create" || mode === "edit") && (
              <LabelForm
                mode={mode}
                titleInput={titleInput}
                setTitleInput={setTitleInput}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                handleUpdate={handleUpdate}
                handleCreate={handleCreate}
              />
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
            <AlertDialogTitle>{t("delete_label_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_label_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
