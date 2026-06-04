import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTaskOrder } from "@/features/boards/boardDetailSlide";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface MoveTaskDialogProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MoveTaskDialog({ taskId, isOpen, onClose }: MoveTaskDialogProps) {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) => state.boardDetail.tasks[taskId]);
  const columns = useAppSelector((state) => state.boardDetail.columns);
  const columnOrder = useAppSelector((state) => state.boardDetail.columnOrder);

  const [selectedColumnId, setSelectedColumnId] = useState<string>(task?.column_id || "");
  const [selectedPosition, setSelectedPosition] = useState<number>(task?.position || 0);
  const [isLoading, setIsLoading] = useState(false);

  if (!task) return null;

  // Calculate available positions for the selected column
  const targetColumn = columns[selectedColumnId];
  const isSameColumn = selectedColumnId === task.column_id;
  const numTasksInTarget = targetColumn ? targetColumn.taskIds.length : 0;
  
  // If same column, max pos is current numTasks - 1. If different column, max pos is numTasks.
  const maxPosition = isSameColumn ? Math.max(0, numTasksInTarget - 1) : numTasksInTarget;
  const positions = Array.from({ length: maxPosition + 1 }, (_, i) => i);

  const handleMove = async () => {
    setIsLoading(true);
    try {
      const updates = [{
        id: task.id,
        column_id: selectedColumnId,
        position: selectedPosition,
        board_id: targetColumn.board_id,
        content: task.content,
      }];
      await dispatch(updateTaskOrder(updates)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to move task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Destination Column</label>
            <Select
              value={selectedColumnId}
              onValueChange={(val) => {
                setSelectedColumnId(val);
                // Reset position to bottom of new column by default
                const col = columns[val];
                if (col) {
                  setSelectedPosition(val === task.column_id ? task.position : col.taskIds.length);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columnOrder.map((colId: string) => (
                  <SelectItem key={colId} value={colId}>
                    {columns[colId]?.title} {colId === task.column_id && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Position</label>
            <Select
              value={selectedPosition.toString()}
              onValueChange={(val) => setSelectedPosition(parseInt(val, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos.toString()}>
                    {pos + 1} {isSameColumn && pos === task.position && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isLoading}>
            {isLoading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
