

export const Card = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="w-full bg-stat-comments-bg  border border-subtle max-h-full  p-4 rounded-2xl">
      <div className="pb-3">
        {icon}
      </div>
      <h2 className="text-3xl ">{title} 2482</h2>
      <p className="text-xs text-text-muted">{description} </p>
    </div>
  );
};
