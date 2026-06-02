import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Kanban, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  // Navigation items configuration
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Boards",
      href: "/boards",
      icon: Kanban,
    },
    {
      title: "Members",
      href: "/members",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className={cn("pb-12 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Task Manager
          </h2>
          <div className="space-y-1">
            <nav className="grid items-start gap-2">
              {navItems.map((item, index) => {
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={index}
                    to={item.href}
                    className={cn(
                      "relative group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent-foreground",
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/40"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
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

        {/* Example section for user's boards */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your Boards
          </h2>
          <ScrollArea className="h-75 px-1">
            <div className="space-y-1 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
              >
                <span className="mr-2">🔵</span> Project Alpha
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
              >
                <span className="mr-2">🟢</span> Marketing Campaign
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
