import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createBoard } from "../boardsSlice";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

// Các màu nền có sẵn để chọn
const BOARD_COLORS = [
  "bg-gradient-to-r from-pink-500 to-rose-500",
  "bg-gradient-to-r from-blue-600 to-violet-600",
  "bg-gradient-to-r from-emerald-500 to-teal-500",
  "bg-gradient-to-r from-orange-400 to-rose-400",
  "bg-slate-900",
];

interface CreateBoardPopoverProps {
  children: React.ReactNode;
  sideOffset?: number;
  align?: "start" | "center" | "end";
  workspaceId?: string;
}

export function CreateBoardPopover({
  children,
  sideOffset = 0,
  align = "start",
  workspaceId,
}: CreateBoardPopoverProps) {
  const dispatch = useAppDispatch();
  const { items: workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspaces);
  const { items: boards } = useAppSelector((state) => state.boards);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId || activeWorkspaceId || "");

  useEffect(() => {
    setSelectedWorkspaceId(workspaceId || activeWorkspaceId || "");
  }, [workspaceId, activeWorkspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedWorkspaceId) return;

    const duplicateBoard = boards.find(
      (b) => b.workspace_id === selectedWorkspaceId && b.title.toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicateBoard) {
      addToast("A board with this title already exists in the selected workspace.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const board = await dispatch(
        createBoard({
          title,
          background: selectedColor,
          type: "public",
          workspaceId: selectedWorkspaceId,
        })
      ).unwrap();
      setOpen(false);
      setTitle("");
      if (board && board.id) {
        navigate(`/boards/${board.id}`);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        className="w-80 pt-3"
        side="right"
      >
        <div className="text-sm font-medium text-center text-neutral-600 mb-4 pb-2 border-b relative">
          Create board
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 right-0 h-auto p-1"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview Box */}
          <div
            className={`aspect-video rounded-md relative flex items-center justify-center ${selectedColor}`}
          >
            <span className="font-bold text-white text-lg drop-shadow-md px-4 text-center wrap-break-word">
              {title || "Board Title"}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Board Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Upgrade your productivity..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Background</Label>
            <div className="grid grid-cols-5 gap-2">
              {BOARD_COLORS.map((color) => (
                <div
                  key={color}
                  className={`w-full h-8 rounded-sm cursor-pointer hover:opacity-80 transition-all ${color} ${
                    selectedColor === color
                      ? "ring-2 ring-neutral-800 ring-offset-1"
                      : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {!workspaceId && workspaces.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="workspaceSelect">Workspace</Label>
              <select
                id="workspaceSelect"
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="w-full rounded-sm border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:ring-0 focus:border-foreground"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
