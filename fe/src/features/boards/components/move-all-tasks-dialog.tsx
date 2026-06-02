import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { moveAllTasks } from "../boardDetailSlide"; // Import action
import { useToast } from "@/context/ToastContext";

interface MoveAllTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceColumnId: string;
  sourceColumnTitle: string;
}

export function MoveAllTasksDialog({
  isOpen,
  onClose,
  sourceColumnId,
  sourceColumnTitle,
}: MoveAllTasksDialogProps) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  // Get all columns from Redux store
  const { columns, columnOrder } = useAppSelector((state) => state.boardDetail);

  const [targetColumnId, setTargetColumnId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Prepare list of potential destination columns (excluding self)
  const availableColumns = columnOrder
    .map((id) => columns[id])
    .filter((col) => col.id !== sourceColumnId);

  // Set default selection when opening
  useEffect(() => {
    if (isOpen && availableColumns.length > 0) {
      setTargetColumnId(availableColumns[0].id);
    }
  }, [isOpen, sourceColumnId]);

  const handleMoveAll = async () => {
    if (!targetColumnId) return;

    setLoading(true);
    try {
      await dispatch(moveAllTasks({ sourceColumnId, targetColumnId })).unwrap();

      addToast(
        `Moved all cards to "${columns[targetColumnId].title}"`,
        "success"
      );
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast("Failed to move cards", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Move All Cards</DialogTitle>
          <DialogDescription>
            Move all cards from <b>"{sourceColumnTitle}"</b> to another list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Destination</Label>
            <div className="col-span-3">
              <Select
                value={targetColumnId}
                onValueChange={setTargetColumnId}
                disabled={availableColumns.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.length > 0 ? (
                    availableColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No other lists available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMoveAll}
            disabled={loading || availableColumns.length === 0}
          >
            {loading ? "Moving..." : "Move All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
