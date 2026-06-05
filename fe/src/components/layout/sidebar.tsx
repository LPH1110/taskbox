import { NavLink, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Settings, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useAppSelector } from "@/store/hooks";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { items: boards } = useAppSelector((state) => state.boards);
  const { activeWorkspaceId } = useAppSelector((state) => state.workspaces);

  const activeWorkspaceBoards = boards.filter((b) => b.workspace_id === activeWorkspaceId);

  // Global Navigation items
  const globalNavItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: Briefcase,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  // Workspace-specific Navigation items
  const workspaceNavItems = activeWorkspaceId
    ? [
        {
          title: "Timeline",
          href: `/workspaces/${activeWorkspaceId}/planner`,
          icon: CalendarDays,
        },
      ]
    : [];

  return (
    <div className={cn("pb-12 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        {/* Workspace Switcher in Header */}
        <WorkspaceSwitcher />

        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overview
            </h2>
            <nav className="grid items-start gap-1">
              {globalNavItems.map((item, index) => {
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.href) && !location.pathname.includes("/planner");

                return (
                  <NavLink
                    key={index}
                    to={item.href}
                    className={cn(
                      "relative group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent-foreground",
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGlobalNavPill"
                        className="absolute inset-0 rounded-md bg-accent z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dynamic Workspace Section */}
        {activeWorkspaceId && (
          <>
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspace Views
              </h2>
              <nav className="grid items-start gap-1">
                {workspaceNavItems.map((item, index) => {
                  const isActive = location.pathname.startsWith(item.href);

                  return (
                    <NavLink
                      key={index}
                      to={item.href}
                      className={cn(
                        "relative group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent-foreground",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeWorkspaceNavPill"
                          className="absolute inset-0 rounded-md bg-primary/10 z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center">
                        <item.icon className={cn("mr-2 h-4 w-4", isActive && "text-primary")} />
                        <span className={cn(isActive && "font-semibold")}>{item.title}</span>
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Boards
              </h2>
              <ScrollArea className="h-[calc(100vh-[450px])] min-h-[200px] px-1">
              <div className="space-y-1 p-1">
                {activeWorkspaceBoards.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground border border-dashed rounded-sm">
                    No boards in workspace.
                  </div>
                ) : (
                  activeWorkspaceBoards.map((board) => (
                    <Link
                      key={board.id}
                      to={`/boards/${board.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent/40 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-foreground/60" />
                      <span className="truncate">{board.title}</span>
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
