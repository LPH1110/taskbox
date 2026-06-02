import { NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
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
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
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
