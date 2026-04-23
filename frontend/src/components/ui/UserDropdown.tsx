import React, { useState, useRef, useEffect } from "react";
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
  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-base border border-default-medium bg-neutral-primary-medium shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-3 border-b border-default-medium text-sm text-heading">
            <div className="font-medium truncate">{name}</div>
            <div className="truncate text-xs opacity-80">{email}</div>
          </div>

          <ul className="p-2 text-sm text-body font-medium list-none">
            <li>
              <a className="block w-full p-2 hover:bg-neutral-tertiary-medium rounded-md">
                Dashboard
              </a>
            </li>

            <li>
              <a className="block w-full p-2 hover:bg-neutral-tertiary-medium rounded-md">
                Settings
              </a>
            </li>

            <li className="mt-1 border-t border-default-medium pt-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left p-2 hover:bg-neutral-tertiary-medium text-fg-danger rounded-md"
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
