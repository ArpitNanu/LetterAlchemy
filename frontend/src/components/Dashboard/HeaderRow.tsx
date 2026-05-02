export const HeaderRow = () => {
  return (
    <div className="grid grid-cols-[3fr_1.5fr_1fr_1fr_100px] px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle bg-brand-surface/10">
      <div>Title</div>

      <div>Status</div>
      <div className="text-center">Likes</div>
      <div className="text-center">Comments</div>
      <div className="text-right">Action</div>
    </div>
  );
};
