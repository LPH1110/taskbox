import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWorkspaceActivity, resetActivityPage } from "../workspacesSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ActivityLog } from "../types";
import {
  UserPlus,
  UserMinus,
  LogOut,
  ShieldAlert,
  Layout,
  Activity,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function formatDistanceToNow(date: Date, _options?: { addSuffix?: boolean }) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

interface ActivityTabProps {
  workspaceId: string;
}


export function ActivityTab({ workspaceId }: ActivityTabProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(["workspaces"]);
  const { activities, isActivitiesLoading, hasMoreActivities, activityPage } =
    useAppSelector((state) => state.workspaces);

  useEffect(() => {
    dispatch(resetActivityPage());
    dispatch(fetchWorkspaceActivity({ workspaceId, page: 1 }));
    return () => {
      dispatch(resetActivityPage());
    };
  }, [dispatch, workspaceId]);

  const handleLoadMore = () => {
    if (!isActivitiesLoading && hasMoreActivities) {
      dispatch(
        fetchWorkspaceActivity({
          workspaceId,
          page: activityPage + 1,
        })
      );
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "member.invited":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      case "member.role_changed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
        );
      case "member.removed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <UserMinus className="h-4 w-4" />
          </div>
        );
      case "member.left":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <LogOut className="h-4 w-4" />
          </div>
        );
      case "board.created":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <Layout className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/20 text-muted-foreground border border-muted/30">
            <Activity className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatActivityText = (log: ActivityLog) => {
    const meta = log.metadata || {};
    const actorName = log.actor?.full_name || meta.actor_name || "Unknown User";

    switch (log.action) {
      case "member.invited":
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> invited{" "}
            <span className="font-semibold text-foreground">
              {meta.target_name || meta.target_email || "someone"}
            </span>{" "}
            as <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/60 border border-input/30">{meta.role || "member"}</span>
          </p>
        );
      case "member.role_changed":
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> changed the role of{" "}
            <span className="font-semibold text-foreground">
              {meta.target_name || meta.target_email || "someone"}
            </span>{" "}
            to <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/60 border border-input/30">{meta.role || "member"}</span>
          </p>
        );
      case "member.removed":
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> removed{" "}
            <span className="font-semibold text-foreground">
              {meta.target_name || meta.target_email || "someone"}
            </span>{" "}
            from the workspace
          </p>
        );
      case "member.left":
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> left the workspace
          </p>
        );
      case "board.created":
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> created board{" "}
            <span className="font-semibold text-foreground">{meta.board_title || "a board"}</span>
          </p>
        );
      default:
        return (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{actorName}</span> performed{" "}
            <span className="font-mono text-xs bg-muted/50 px-1 py-0.5 rounded">{log.action}</span>
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-input/10 pb-4">
        <History className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{t("workspaces:activity_log")}</h3>
      </div>

      {activities.length === 0 && !isActivitiesLoading ? (
        <div className="text-center py-12 bg-input/10 rounded-lg border border-input/20">
          <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-input/20 pl-6 ml-4 space-y-8">
          {activities.map((log) => {
            const meta = log.metadata || {};
            const actorName = log.actor?.full_name || meta.actor_name || "Unknown User";
            const actorEmail = log.actor?.email || meta.actor_email || "";

            return (
              <div key={log.id} className="relative flex gap-4">
                {/* Timeline node */}
                <div className="absolute -left-10 top-0.5">
                  {getActionIcon(log.action)}
                </div>

                <Avatar className="h-8 w-8 border border-input/30">
                  <AvatarImage
                    src={log.actor?.avatar_url || ""}
                    alt={actorName}
                  />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {actorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    {formatActivityText(log)}
                    <span className="text-2xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <span className="text-2xs text-muted-foreground block">
                    by {actorName} {actorEmail && `(${actorEmail})`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMoreActivities && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isActivitiesLoading}
            className="w-full max-w-xs shadow-xs"
          >
            {isActivitiesLoading ? "Loading..." : "Load More Activity"}
          </Button>
        </div>
      )}

      {isActivitiesLoading && activities.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
