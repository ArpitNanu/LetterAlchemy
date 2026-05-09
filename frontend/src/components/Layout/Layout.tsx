import { SideBar } from "@/components/Layout/SideBar";
import { TopBar } from "@/components/Layout/TopBar";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0">
        <TopBar />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] flex-1 overflow-hidden">
        <nav className="hidden md:block border-r border-border-subtle overflow-y-auto bg-sidebar-bg"> 
          <SideBar />
        </nav>
        <main className="overflow-hidden h-full bg-page-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
