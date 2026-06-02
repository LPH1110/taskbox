import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWorkspaces, setActiveWorkspaceId } from "../workspacesSlice";
import { fetchBoards } from "@/features/boards/boardsSlice";
import { BoardCard } from "@/features/boards/components/board-card";
import { NewBoardButton } from "@/features/boards/components/new-board-button";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Star, FolderClosed, Trash2, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: workspaces } = useAppSelector((state) => state.workspaces);
  const { items: boards } = useAppSelector((state) => state.boards);

  const workspace = workspaces.find((w) => w.id === workspaceId);

  useEffect(() => {
    dispatch(fetchWorkspaces());
    dispatch(fetchBoards());
    if (workspaceId) {
      dispatch(setActiveWorkspaceId(workspaceId));
    }
  }, [dispatch, workspaceId]);

  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Workspace not found.</p>
        <Link to="/workspaces" className="mt-4 inline-block text-sm font-bold underline">
          Back to Workspaces
        </Link>
      </div>
    );
  }

  const workspaceBoards = boards.filter((b) => b.workspace_id === workspaceId);
  const favoriteBoards = workspaceBoards.filter((b) => b.is_favorite);

  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      navigate("/workspaces");
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <div className="space-y-8 px-4 pb-16">
      {/* Back button and workspace header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end justify-between">
        <div className="space-y-4">
          <Link to="/workspaces" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Workspaces
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-3xl">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Workspace Operations (e.g. Settings / Delete) */}
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your workspace and all its associated boards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Starred Boards inside this workspace */}
      {favoriteBoards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span>Starred boards</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {favoriteBoards.map((board) => (
              <motion.div key={`fav-${board.id}`} layout variants={itemVariants}>
                <BoardCard board={board} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Boards Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <FolderClosed className="h-5 w-5" />
          <span>Workspace Boards</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {/* Create Button is always first */}
          <motion.div layout variants={itemVariants}>
            <NewBoardButton workspaceId={workspaceId} />
          </motion.div>

          {/* Render List */}
          {workspaceBoards.map((board) => (
            <motion.div key={`all-${board.id}`} layout variants={itemVariants}>
              <BoardCard board={board} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
