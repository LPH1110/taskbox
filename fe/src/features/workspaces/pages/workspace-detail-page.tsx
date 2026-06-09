import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWorkspaces, setActiveWorkspaceId } from "../workspacesSlice";
import { fetchBoards } from "@/features/boards/boardsSlice";
import { BoardCard } from "@/features/boards/components/board-card";
import { NewBoardButton } from "@/features/boards/components/new-board-button";
import { MembersTab } from "../components/members-tab";
import { ActivityTab } from "../components/activity-tab";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Star,
  FolderClosed,
  Trash2,
  ArrowLeft,
  Users,
  History,
  Layout,
} from "lucide-react";
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

type TabId = "boards" | "members" | "activity";

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(["workspaces"]);

  const [activeTab, setActiveTab] = useState<TabId>("boards");

  const { items: workspaces } = useAppSelector((state) => state.workspaces);
  const { items: boards } = useAppSelector((state) => state.boards);
  const currentUser = useAppSelector((state) => state.auth.user);

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
        <p className="text-muted-foreground">{t("not_found")}</p>
        <Link to="/workspaces" className="mt-4 inline-block text-sm font-bold underline">
          {t("back_to_workspaces")}
        </Link>
      </div>
    );
  }

  const workspaceBoards = boards.filter((b) => b.workspace_id === workspaceId);
  const favoriteBoards = workspaceBoards.filter((b) => b.is_favorite);
  const isOwner = currentUser?.id === workspace.owner_id;


  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      navigate("/workspaces");
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  const tabs = [
    { id: "boards", label: t("boards_tab"), icon: Layout },
    { id: "members", label: t("members_tab"), icon: Users },
    { id: "activity", label: t("activity_tab"), icon: History },
  ] as const;

  return (
    <div className="space-y-8 px-4 pb-16">
      {/* Back button and workspace header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end justify-between">
        <div className="space-y-4">
          <Link to="/workspaces" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("back_to_workspaces")}
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
        {isOwner && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> {t("delete_workspace")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("are_you_sure")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("delete_workspace_warning")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("workspaces:cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t("delete_workspace")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-input/20 pb-px gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg outline-none ${isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content rendering */}
      <div className="pt-2">
        {activeTab === "boards" && (
          <div className="space-y-8">
            {/* Starred Boards inside this workspace */}
            {favoriteBoards.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>{t("workspaces:starred_boards")}</span>
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

            {/* Boards Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
                <FolderClosed className="h-5 w-5" />
                <span>{t("workspaces:workspace_boards")}</span>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              >
                {/* Create Button is always first */}
                <motion.div variants={itemVariants}>
                  <NewBoardButton workspaceId={workspaceId} />
                </motion.div>

                {/* Render List */}
                {workspaceBoards.map((board) => (
                  <motion.div key={`all-${board.id}`} variants={itemVariants}>
                    <BoardCard board={board} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === "members" && workspaceId && (
          <MembersTab workspaceId={workspaceId} />
        )}

        {activeTab === "activity" && workspaceId && (
          <ActivityTab workspaceId={workspaceId} />
        )}
      </div>
    </div>
  );
}
