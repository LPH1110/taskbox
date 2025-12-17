import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards } from "../boardsSlice";
import { BoardCard } from "../components/board-card";
import { NewBoardButton } from "../components/new-board-button";
import { Separator } from "@/components/ui/separator";
import { Clock, Star } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { boards, isLoading } = useAppSelector((state) => state.boards);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Simple Skeleton Loading
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading workspaces...
      </div>
    );
  }

  const favoriteBoards = boards.filter((b) => b.is_favorite);

  return (
    <div className="space-y-8 px-4">
      {/* 1. Favorite Boards Section (Optional) */}
      {favoriteBoards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <Star className="h-5 w-5" />
            <span>Starred boards</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}

      {/* 2. All Boards Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Clock className="h-5 w-5" />
          <span>Your Workspaces</span>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Create Button is always first */}
          <NewBoardButton />

          {/* Render List */}
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </div>
    </div>
  );
}
