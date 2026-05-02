type Blog = {
  id: number;
  title: string;
  published: boolean;
  _count: {
    likes: number;
    comments: number;
  };
};
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BlogRow = ({ blog, onDelete }: { blog: Blog; onDelete: (id: number) => void }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this masterpiece?")) {
      onDelete(blog.id);
    }
  };

  return (
    <div className="grid grid-cols-[3fr_1.5fr_1fr_1fr_100px] px-6 py-4 items-center hover:bg-brand-surface/20 transition-colors group">
      <div className="text-text-main font-medium leading-relaxed pr-8">{blog.title}</div>

      <div>
        <span
          className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-black shadow-sm ${
            blog.published
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {blog.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="text-text-muted text-sm text-center font-mono">{blog._count.likes}</div>

      <div className="text-text-muted text-sm text-center font-mono">{blog._count.comments}</div>
      
      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => navigate(`/editor/${blog.id}`)}
          className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-surface rounded-lg transition-all"
          title="Edit"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={handleDelete}
          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Delete"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
};
