import { SideBar } from "@/components/Layout/SideBar";
import { TopBar } from "@/components/Layout/TopBar";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="">
      <header className="">
        <TopBar />
      </header>

      <div className="grid grid-cols-[200px_minmax(900px,1fr)] h-screen ">
        <nav className="border-2 border-t-0 border-l-0 border-b-0 border-r-border-subtle">
          <SideBar />
        </nav>
        <main className="">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
