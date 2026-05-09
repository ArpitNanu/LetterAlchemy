import { BookOpen, SquarePen, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import UserDropdown from "../ui/UserDropdown";
import SearchBox from "../ui/SearchBox";

export const TopBar = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const { state } = useAuth();
  const user = state.user;

  return (
    <div className="h-16 border-b border-border-subtle bg-surface flex shrink-0">
      {/* Left Branding Area - Responsive width */}
      <div className="w-auto md:w-[240px] border-r-0 md:border-r border-border-subtle flex items-center px-4 md:px-6">
        <button 
          className="flex items-center gap-2 group transition-all" 
          onClick={() => navigate("/home")}
        >
          <BookOpen className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform" />
          <h1 className="text-lg md:text-xl font-serif font-bold text-brand-primary tracking-tight">
            LetterAlchemy
          </h1>
        </button>
      </div>

      {/* Right Actions Area */}
      <div className="flex-1 flex items-center justify-between px-4 md:px-8 gap-4 md:gap-8">
        {/* Search Box Component - hidden or simplified on very small screens if needed, but let's keep it for now */}
        <div className="flex-1 max-w-md">
          <SearchBox />
        </div>

        {/* Global Actions Section */}
        <div className="flex items-center gap-2 md:gap-5">
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-brand-surface transition-colors group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-brand-primary group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-text-muted group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          <button
            onClick={() => navigate("/editor/new")}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-brand-primary text-white hover:bg-brand-highlight transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <SquarePen className="w-4 h-4" />
            <span className="text-sm font-medium hidden md:inline">Write</span>
          </button>

          <div className="h-8 w-[1px] bg-border-subtle mx-1 md:mx-2" />

          <UserDropdown
            name={`${user?.firstName || "User"} ${user?.lastName || ""}`}
            email={user?.email || "No email"}
            avatarUrl={(user as any)?.avatar || "/docs/images/people/profile-picture-5.jpg"}
          />
        </div>
      </div>
    </div>
  );
};
