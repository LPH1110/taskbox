import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { moveColumnToDifferentBoard } from "@/features/boards/boardDetailSlide";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

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
  const { t } = useTranslation(["boards"]);
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
        try {
          const response = await api.get<any, { success: boolean; data: SimpleBoard[] }>("/boards");
          if (response.data) {
            const filtered = response.data.filter((b: SimpleBoard) => b.id !== currentBoardId);
            setBoards(filtered);
            if (filtered.length > 0) setTargetBoardId(filtered[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch boards for move:", error);
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

      addToast(t("move_column_success", { title: columnTitle }), "success");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast(t("move_column_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("move_list")}</DialogTitle>
          <DialogDescription>
            {t("move_list_desc", { title: columnTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Target Board Selection (Shadcn Select) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("board")}</Label>
            <div className="col-span-3">
              <Select
                value={targetBoardId}
                onValueChange={setTargetBoardId}
                disabled={boards.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("select_board_placeholder")} />
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
                      {t("no_other_boards_found")}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Position Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              {t("position")}
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
            {t("cancel")}
          </Button>
          <Button
            onClick={handleMove}
            disabled={loading || boards.length === 0}
          >
            {loading ? t("moving") : t("move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
