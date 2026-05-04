import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl: string;
}

const UserDropdown = ({ name, email, avatarUrl }: UserProfileProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useAuth();
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open user menu</span>
        <img
          className="w-10 h-10 rounded-full cursor-pointer object-cover"
          src={avatarUrl}
          alt="User profile"
        />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-56 origin-top-right rounded-xl border border-border-subtle bg-brand-surface shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-border-subtle bg-white/50 dark:bg-black/20">
            <p className="text-sm font-bold text-text-main truncate">{name}</p>
            <p className="text-xs text-text-muted truncate mt-0.5">{email}</p>
          </div>

          {/* Menu Items */}
          <nav className="p-1.5 flex flex-col gap-0.5">
            <button
              onClick={() => { navigate("/dashboard"); setIsOpen(false); }}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-text-main rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-200 group"
            >
              Dashboard
            </button>

            <button
              onClick={() => { navigate("/profile"); setIsOpen(false); }}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-text-main rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-200 group"
            >
              Settings
            </button>

            {/* Horizontal Divider */}
            <div className="h-[1px] bg-border-subtle my-1.5 mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
