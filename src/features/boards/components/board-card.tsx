import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { type Board } from "../types";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { toggleBoardFavorite } from "../boardsSlice";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const dispatch = useAppDispatch();

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking star
    dispatch(
      toggleBoardFavorite({ boardId: board.id, isFavorite: board.is_favorite })
    );
  };

  return (
    <Link
      to={`/boards/${board.id}`}
      className={cn(
        "group relative block h-32 w-full overflow-hidden rounded-md p-4 transition-all hover:opacity-90 md:h-28",
        board.background_image
      )}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

      {/* Title */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <h3 className="truncate font-bold text-white">{board.title}</h3>

        {/* Favorite Icon (Visible on hover or if favorited) */}
        <div
          onClick={handleStarClick}
          className={cn(
            "absolute bottom-0 right-0 -mb-8 mr-2 transition-all duration-300 group-hover:mb-0",
            board.is_favorite
              ? "mb-0 text-yellow-400"
              : "text-white opacity-0 group-hover:opacity-100 hover:text-yellow-400"
          )}
        >
          <Star
            className={cn("h-5 w-5", board.is_favorite && "fill-yellow-400")}
          />
        </div>
      </div>
    </Link>
  );
}
