import { SideBar } from "@/components/Layout/SideBar";
import { TopBar } from "@/components/Layout/TopBar";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0">
        <TopBar />
      </header>

      <div className="grid grid-cols-[200px_minmax(900px,1fr)] flex-1 overflow-hidden">
        <nav className="border-2 border-t-0 border-l-0 border-b-0 border-r-border-subtle overflow-y-auto"> {/* remove scrollbar of sidebar */}
          <SideBar />
        </nav>
        <main className="overflow-hidden h-full">  {/* for remove scrollbar of main content*/}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
