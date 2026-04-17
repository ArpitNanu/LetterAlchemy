export const SideBarButton = ({ icon, name }) => {
  return (
    <div className="flex gap-2 cursor-pointer">
      <span>{icon}</span>
      <span>{name}</span>
    </div>
  );
};
