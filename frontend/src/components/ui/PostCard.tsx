import { Bookmark, CalendarDays, Heart, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toggleLike, toggleBookmark } from "@/api/postApi";

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
  isLiked?: boolean;
  isBookmarked?: boolean;
};

type PostcardProp = {
  posts: Post[];
};

const PostItem = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  // Initialize with values from the post (if provided by backend)
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await toggleLike(post.id);
      if (!res.success) {
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (error) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic Update
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await toggleBookmark(post.id);
      if (!res.success) {
        setIsBookmarked(prevBookmarked);
      }
    } catch (error) {
      setIsBookmarked(prevBookmarked);
    }
  };

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="group flex flex-col py-8 border-y border-transparent border-b-border-subtle hover:border-brand-primary/40 hover:bg-brand-surface px-6 transition-all rounded-xl cursor-pointer"
    >
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
          <Link to={`/post/${post.id}`} onClick={(e) => e.stopPropagation()}>
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
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            
            <div
              className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors hover:text-red-500"
              onClick={handleLike}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${
                  isLiked ? "fill-red-500 text-red-500 scale-110" : ""
                }`}
              />
              {likesCount}
            </div>

            <div
              className="flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:text-brand-primary"
              onClick={handleCommentClick}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {post.comments || 0}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest ml-auto">
              <Bookmark
                className={`w-3.5 h-3.5 cursor-pointer transition-colors hover:text-green-500 ${
                  isBookmarked ? "fill-green-500 text-green-500 scale-110" : ""
                }`}
                onClick={handleBookmark}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostCard = ({ posts }: PostcardProp) => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {posts?.map((post) => {
        return <PostItem key={post.id} post={post} />;
      })}
    </div>
  );
};

export default PostCard;


