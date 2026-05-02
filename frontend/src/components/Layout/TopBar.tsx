import { BookOpen, Search, SquarePen, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import UserDropdown from "../ui/UserDropdown";

export const TopBar = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme(); // Same hook — stays in sync with the Profile page toggle
  return (
    <div>
      <div className="flex justify-between items-center m-2 border-2 border-t-0 border-l-0 border-r-0 border-b-border-subtle">
        <div className=" flex gap-1 cursor-pointer items-center ">
          <button className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/home")}>
            <BookOpen className="text-brand-primary" />
          <h1 className="text-2xl font-serif font-bold text-brand-primary">LetterAlchemy</h1>
          </button>
          
        </div>
        <div className="flex rounded-4xl bg-brand-surface border border-border-subtle">
          <Search className="top-3 m-3" />
          <input
            className="outline-none px-2 flex-1"
            type="text"
            placeholder="Search"
          />
        </div>

        {/* Dark Mode Toggle in TopBar */}
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5 text-brand-primary" /> : <Moon className="w-5 h-5 text-text-muted" />}
        </button>
        <button
          onClick={() => navigate("/editor/new")}
          className="flex gap-1 cursor-pointer"
        >
          <SquarePen />
          <span>Write</span>
        </button>
        <UserDropdown
          name="Bonnie Green"
          email="name@flowbite.com"
          avatarUrl="/docs/images/people/profile-picture-5.jpg"
        />
      </div>
    </div>
  );
};
