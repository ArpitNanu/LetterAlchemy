type Blog = {
  id: number;
  title: string;
  status: "Draft" | "Published";
  likes: number;
  comments: number;
};
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

const HandleDeleteBlog = () => {
  const confirmDelete = window.confirm("Delete this blog?");
};

export const BlogRow = ({ blog }: { blog: Blog }) => {
  const [DraftId, setDraftId] = useState(null);
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-5 px-4 py-3 border-b border-zinc-800">
      <div className="text-black">{blog.title}</div>

      <div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            blog.status === "Published"
              ? "bg-green-500/10 text-green-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {blog.status}
        </span>
      </div>

      <div className="text-zinc-400">{blog.likes}</div>

      <div className="text-zinc-400">{blog.comments}</div>
      <div className="flex gap-2">
        <button>
          <Edit />
        </button>
        <button onClick={HandleDeleteBlog}>
          <Trash />
        </button>
      </div>
    </div>
  );
};
