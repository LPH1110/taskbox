import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards } from "../boardsSlice";
import { fetchWorkspaces } from "@/features/workspaces/workspacesSlice";
import { BoardCard } from "../components/board-card";
import { NewBoardButton } from "../components/new-board-button";
import { Separator } from "@/components/ui/separator";
import { Star, FolderClosed } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["boards", "workspaces"]);
  const dispatch = useAppDispatch();
  const { items: boards, isLoading: isLoadingBoards } = useAppSelector((state) => state.boards);
  const { items: workspaces, isLoading: isLoadingWorkspaces } = useAppSelector((state) => state.workspaces);

  useEffect(() => {
    dispatch(fetchBoards());
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  if (isLoadingBoards || isLoadingWorkspaces) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("boards:loading_workspaces_boards")}
      </div>
    );
  }

  const favoriteBoards = boards.filter((b) => b.is_favorite);


  return (
    <div className="space-y-12 px-4 pb-16">
      {/* 1. Starred Boards Section */}
      {favoriteBoards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span>{t("boards:starred_boards_title")}</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {favoriteBoards.map((board) => (
              <motion.div key={`fav-${board.id}`} variants={itemVariants}>
                <BoardCard board={board} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 2. Group Boards by Workspace */}
      <div className="space-y-10">
        {workspaces.map((workspace) => {
          const workspaceBoards = boards.filter((b) => b.workspace_id === workspace.id);

          return (
            <div key={workspace.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg text-foreground uppercase tracking-tight">
                  <FolderClosed className="h-5 w-5" />
                  <span>{workspace.name}</span>
                </div>
                <Link
                  to={`/workspaces/${workspace.id}`}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
                >
                  {t("workspaces:view_workspace")}
                </Link>
              </div>

              <Separator className="my-2" />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              >
                {/* Create Button scoped to this workspace */}
                <motion.div variants={itemVariants}>
                  <NewBoardButton workspaceId={workspace.id} />
                </motion.div>

                {/* Workspace Boards */}
                {workspaceBoards.map((board) => (
                  <motion.div key={`board-${board.id}`} variants={itemVariants}>
                    <BoardCard board={board} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          );
        })}

        {workspaces.length === 0 && (
          <div className="border-2 border-dashed border-muted p-12 text-center rounded-none">
            <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
              {t("workspaces:no_workspaces")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("workspaces:no_workspaces_desc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
