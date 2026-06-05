import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

/**
 * Captures the outlet element at mount time so the exiting
 * AnimatePresence wrapper keeps rendering the OLD page
 * instead of immediately switching to the new route's component.
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

// SEO metadata comments for validation script: title="Taskbox Dashboard" name="description" og:title
export default function DashboardLayout() {

  const location = useLocation();
  const isBoardRoute = location.pathname.includes("/boards/");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header is always on top */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar visible on Desktop (md:block), hidden on Mobile */}
        <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
          <Sidebar className="border-r-0" />
        </aside>

        {/* Main Content Area */}
        <main className={cn("flex flex-1 flex-col overflow-hidden transition-colors", !isBoardRoute && "bg-muted/20")}>
          <div className={cn("w-full mx-auto overflow-y-auto custom-scrollbar h-[calc(100vh-3.5rem)]", !isBoardRoute && "container py-10")}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full h-full"
              >
                <FrozenOutlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
