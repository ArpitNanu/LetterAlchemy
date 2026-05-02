import { Bookmark, Home, LayoutDashboard, User } from "lucide-react";
import { SideBarButton } from "./SideBarButton";

SideBarButton;

export const SideBar = () => {
  return (
    <div className="flex flex-col gap-8 p-3">
      <SideBarButton icon={<Home />} name="Home" path="/home" />
      <SideBarButton icon={<Bookmark />} name="Bookmark" path="/bookmark" />
      <SideBarButton
        icon={<LayoutDashboard />}
        name="Dashboard"
        path="/dashboard"
      />
      <SideBarButton icon={<User />} name="Profile" path="/profile" />
    </div>
  );
};
