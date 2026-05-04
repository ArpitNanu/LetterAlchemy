import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const SideBarButton = ({
  icon,
  name,
  path,
}: {
  icon: React.ReactNode;
  name: string;
  path: string;
}) => {
  const navigate = useNavigate();
  // --- 🎓 ARCHITECTURE LEARNING MOMENT: Dynamic Styling ---
  // 1. location.pathname: React Router's way of telling us exactly which URL the user is on.
  // 2. isActive: We compare the current URL (location.pathname) with the button's destination (path).
  // 3. cn(...) function: This is a powerful utility (from lib/utils.ts) that merges Tailwind classes.
  //    It lets us write conditional logic: "If active, apply green bg; otherwise, apply hover effects."
  //    It also prevents "class conflicts" (like if two different paddings were accidentally applied).
  // -------------------------------------------------------
  const isActive = location.pathname === path;

  return (
    <div 
      onClick={() => navigate(path)} 
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group",
        isActive 
          ? "bg-brand-surface text-brand-primary font-semibold shadow-sm" 
          : "hover:bg-brand-surface/50 text-text-muted hover:text-brand-primary"
      )}
    >
      <span className={cn(
        "transition-transform group-hover:scale-110",
        isActive ? "text-brand-primary" : "text-text-muted group-hover:text-brand-primary"
      )}>{icon}</span>
      <span className="text-sm">{name}</span>
    </div>
  );
};
