import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export default function DashboardLayout() {
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
          <div className="container pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
