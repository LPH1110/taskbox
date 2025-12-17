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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { moveColumnToDifferentBoard } from "../boardDetailSlide";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";

interface MoveColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnTitle: string;
}

interface SimpleBoard {
  id: string;
  title: string;
}

export function MoveColumnDialog({
  isOpen,
  onClose,
  columnId,
  columnTitle,
}: MoveColumnDialogProps) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const currentBoardId = useAppSelector(
    (state) => state.boardDetail.currentBoard?.id
  );

  const [boards, setBoards] = useState<SimpleBoard[]>([]);
  const [targetBoardId, setTargetBoardId] = useState<string>("");
  const [position, setPosition] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch all boards to populate dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchBoards = async () => {
        const { data } = await supabase
          .from("boards")
          .select("id, title")
          .neq("id", currentBoardId); // Exclude current board

        if (data) {
          setBoards(data);
          if (data.length > 0) setTargetBoardId(data[0].id);
        }
      };
      fetchBoards();
    }
  }, [isOpen, currentBoardId]);

  const handleMove = async () => {
    if (!targetBoardId) return;
    setLoading(true);
    try {
      await dispatch(
        moveColumnToDifferentBoard({
          columnId,
          targetBoardId,
          newPosition: Number(position),
        })
      ).unwrap();

      addToast(`Moved "${columnTitle}" successfully`, "success");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast("Failed to move list", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Move List</DialogTitle>
          <DialogDescription>
            Move <b>"{columnTitle}"</b> to another board.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Target Board Selection (Shadcn Select) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Board</Label>
            <div className="col-span-3">
              <Select
                value={targetBoardId}
                onValueChange={setTargetBoardId}
                disabled={boards.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.length > 0 ? (
                    boards.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No other boards found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Position Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <Input
              id="position"
              type="number"
              min={0}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={loading || boards.length === 0}
          >
            {loading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
