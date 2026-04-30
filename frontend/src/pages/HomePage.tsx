import { getPublicPost } from "@/api/postApi";
import { RecommdeationRightSideBar } from "@/components/Home/RecommdeationRightSideBar";
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
    <div className="grid grid-cols-[3fr_1fr] h-full overflow-hidden">
      <div className="overflow-y-auto pr-2 pb-10">
        <PostCard posts={post} />
      </div>
      <aside className="overflow-hidden">
        <RecommdeationRightSideBar />
      </aside>
    </div>
  );
};
