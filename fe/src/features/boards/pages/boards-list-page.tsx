import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards } from "../boardsSlice";
import { BoardCard } from "../components/board-card";
import { NewBoardButton } from "../components/new-board-button";
import { Separator } from "@/components/ui/separator";
import { Clock, Star } from "lucide-react";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
} as const;

export default function BoardsListPage() {
  const dispatch = useAppDispatch();
  const { items: boards, isLoading } = useAppSelector((state) => state.boards);

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
    <div className="space-y-8 px-4 pb-8">
      {/* 1. Favorite Boards Section (Optional) */}
      {favoriteBoards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <Star className="h-5 w-5" />
            <span>Starred boards</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {favoriteBoards.map((board) => (
              <motion.div key={`fav-${board.id}`} layout variants={itemVariants}>
                <BoardCard board={board} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 2. All Boards Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Clock className="h-5 w-5" />
          <span>Your Workspaces</span>
        </div>

        <Separator className="my-4" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {/* Create Button is always first */}
          <motion.div layout variants={itemVariants}>
            <NewBoardButton />
          </motion.div>

          {/* Render List */}
          {boards.map((board) => (
            <motion.div key={`all-${board.id}`} layout variants={itemVariants}>
              <BoardCard board={board} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
