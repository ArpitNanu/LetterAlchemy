import { Bookmark, CalendarDays, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

type Post = {
  id: string;
  title: string;
  createdAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  likes?: number;
  comments?: number;
};

type PostcardProp = {
  posts: Post[];
};

export const PostCard = ({ posts }: PostcardProp) => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {posts?.map((post) => {
        return (
          <div key={post.id} className="group flex flex-col py-8 border-b border-border-subtle last:border-0 hover:bg-brand-surface/30 px-4 transition-all rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                {post.author?.firstName?.[0]}
              </div>
              <span className="text-sm font-medium text-text-main uppercase tracking-wider">
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>

            <div className="flex justify-between gap-8">
              <div className="flex-1 flex flex-col gap-3">
                <Link to={`/post/${post.id}`}>
                  <h2 className="text-2xl font-extrabold text-text-main group-hover:text-brand-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-text-muted line-clamp-2 text-sm leading-relaxed mb-2">
                  Discover the intricate details of this LetterAlchemy creation...
                </p>

                <div className="flex items-center gap-6 text-text-muted">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comments || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest ml-auto">
                    <Bookmark className="w-3.5 h-3.5 cursor-pointer hover:text-brand-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default PostCard;
