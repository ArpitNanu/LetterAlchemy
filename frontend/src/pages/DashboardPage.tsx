import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeaderRow } from "@/components/Dashboard/HeaderRow";
import { BlogRow } from "@/components/Dashboard/BlogTable";
import { Card } from "@/components/Dashboard/StatisticsCard";
import { getUserProfile } from "@/api/UserApi";
import { getAllUserPosts, deletePost } from "@/api/postApi";
import {
  Heart,
  MessageCircle,
  MessageSquareCheck,
  StickyNote,
} from "lucide-react";

export const Dashboard = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Parallel fetching for better performance
        const [statsData, postsData] = await Promise.all([
          getUserProfile(),
          getAllUserPosts()
        ]);

        if (statsData.success) {
          setStats(statsData.data.stats);
        }

        if (postsData.success) {
          setPosts(postsData.data);
        }
      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeletePost = async (id: number) => {
    try {
      const res = await deletePost(id);
      if (res.success) {
        // Optimistic UI update for the post list
        setPosts((prev) => prev.filter((post) => post.id !== id));
        
        // Re-fetch stats to update the counter cards
        const statsData = await getUserProfile();
        if (statsData.success) {
          setStats(statsData.data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-text-muted animate-pulse font-serif">Aligning the sanctuary...</div>;
  }

  return (
    <div className="bg-essay-bg h-[calc(100%-2rem)] p-6 rounded-xl m-4 overflow-y-auto">
      <h2 className="text-2xl font-bold text-brand-primary mb-1">
        Your Sanctuary
      </h2>
      <h1 className="text-xl text-text-muted mb-6">
        Welcome back, {state.user?.firstName || "Alchemist"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <Card 
          icon={<Heart className="text-red-500" />} 
          title={stats?.totalLikes?.toString() || "0"} 
          description="TOTAL LIKES" 
        />
        <Card 
          icon={<MessageCircle className="text-blue-500" />} 
          title={stats?.totalComments?.toString() || "0"} 
          description="TOTAL COMMENTS" 
        />
        <Card 
          icon={<StickyNote className="text-amber-500" />} 
          title={stats?.drafts?.toString() || "0"} 
          description="DRAFTS" 
        />
        <Card 
          icon={<MessageSquareCheck className="text-brand-primary" />} 
          title={stats?.published?.toString() || "0"} 
          description="PUBLISHED" 
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="text-2xl font-bold">
          <p className="text-text-main">Post</p>
          <p className="text-text-main">Management</p>
        </div>
        <button
          className="bg-brand-primary text-white hover:bg-brand-strong transition-colors font-medium rounded-xl text-sm px-6 py-2.5 cursor-pointer shadow-sm"
          onClick={() => navigate("/editor/new")}
        >
          New Post
        </button>
      </div>

      <div className="bg-surface mt-4 rounded-2xl border border-border-subtle overflow-hidden">
        <HeaderRow />
        <div className="divide-y divide-border-subtle">
          {posts.length > 0 ? (
            posts.map((post) => (
              <BlogRow key={post.id} blog={post} onDelete={handleDeletePost} />
            ))
          ) : (
            <div className="p-10 text-center text-text-muted italic">
              No ink spilled yet. Start your first masterpiece!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
