import { useNavigate } from "react-router-dom";

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
  return (
    <div onClick={() => navigate(path)} className="flex items-center gap-2 w-full p-2 rounded-sm cursor-pointer hover:bg-[#caecbc] hover:text-brand-primary">
      <span>{icon}</span>
      <span>{name}</span>
    </div>
  );
};
