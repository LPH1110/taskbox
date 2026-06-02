import type { Workspace } from "../types";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      <Link to={`/workspaces/${workspace.id}`} className="absolute inset-0 z-10" />
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xl">
          {workspace.name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-card-foreground group-hover:text-primary transition-colors">
            {workspace.name}
          </h3>
          {workspace.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workspace.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-muted-foreground/70" />
          {workspace._count?.boards ?? 0} {workspace._count?.boards === 1 ? "Board" : "Boards"}
        </span>
        <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100 font-semibold">
          View Workspace →
        </span>
      </div>
    </motion.div>
  );
}
