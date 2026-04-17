import { SideBar } from "@/components/Layout/SideBar";
import { TopBar } from "@/components/Layout/TopBar";
import { HomePage } from "@/pages/HomePage";

export const Layout = () => {
  return (
    <div className="">
      <header className="">
        <TopBar />
      </header>
      <div className="grid grid-cols-[200px_minmax(900px,1fr)] h-screen ">
        <nav className="">
          <SideBar />
        </nav>
        <main className="">
          <HomePage />
        </main>
      </div>
    </div>
  );
};
