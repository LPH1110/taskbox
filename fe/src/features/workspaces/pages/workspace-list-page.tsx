import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWorkspaces } from "../workspacesSlice";
import { WorkspaceCard } from "../components/workspace-card";
import { CreateWorkspaceDialog } from "../components/create-workspace-dialog";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

export default function WorkspaceListPage() {
  const dispatch = useAppDispatch();
  const { items: workspaces, isLoading, error } = useAppSelector((state) => state.workspaces);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select or create a workspace to view your project boards.
          </p>
        </div>
        <div>
          <CreateWorkspaceDialog />
        </div>
      </div>

      {isLoading && workspaces.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-dashed border-muted bg-muted/10 p-6"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-center text-destructive font-medium">
          Failed to load workspaces: {error}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted p-12 text-center">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            No Workspaces
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't belong to any workspaces yet. Create your first one to get started!
          </p>
          <div className="mt-6">
            <CreateWorkspaceDialog />
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {workspaces.map((workspace) => (
            <motion.div key={workspace.id} variants={itemVariants}>
              <WorkspaceCard workspace={workspace} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
