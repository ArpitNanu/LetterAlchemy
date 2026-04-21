import { getPublicPost } from "@/api/postApi";
import PostCard from "@/components/ui/PostCard";
import { useEffect, useState } from "react";

export const HomePage = () => {
  const [post, setPost] = useState([]);
  useEffect(() => {
    const publicPost = async () => {
      try {
        const res = await getPublicPost();
        if (!res.success) return;
        setPost(res.data);
      } catch (error) {}
    };
    publicPost();
  }, []);
  return (
    <div className=" flex h-full">
      <div className="flex-1">
        <PostCard posts={post} />
      </div>
      <aside className="w-80">rightsidddfebar</aside>
    </div>
  );
};
