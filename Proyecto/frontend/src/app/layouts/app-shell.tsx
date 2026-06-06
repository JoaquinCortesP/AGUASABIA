import { Outlet } from "react-router-dom";
import { useUiStore } from "@/app/store/ui-store";
import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils/cn";

export function AppShell() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppSidebar />
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "md:pl-20" : "md:pl-72",
        )}
      >
        <Topbar />
        <main className="px-4 py-5 pb-24 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
