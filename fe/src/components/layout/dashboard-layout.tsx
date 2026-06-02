import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header is always on top */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar visible on Desktop (md:block), hidden on Mobile */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <Sidebar className="border-r-0" />
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-muted/20">
          <div className="w-full mx-auto container py-10 overflow-y-auto custom-scrollbar h-[calc(100vh-3.5rem)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
