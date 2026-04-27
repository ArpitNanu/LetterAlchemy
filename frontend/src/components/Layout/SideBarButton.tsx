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
    <div onClick={() => navigate(path)} className="flex gap-2 cursor-pointer">
      <span>{icon}</span>
      <span>{name}</span>
    </div>
  );
};
