import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeaderRow } from "@/components/Dashboard/HeaderRow";
import { BlogRow } from "@/components/Dashboard/BlogTable";
import { Card } from "@/components/Dashboard/StatisticsCard";
import {
  Heart,
  MessageCircle,
  MessageSquareCheck,
  MessagesSquare,
  StickyNote,
} from "lucide-react";

const blogs = [
  {
    id: 1,
    title: "React Hooks Guide",
    status: "Draft",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    title: "AI Future Trends",
    status: "Published",
    likes: 45,
    comments: 10,
  },
];
export const Dashboard = () => {
  const { state } = useAuth();
  const navigator = useNavigate();
  return (
    <div className="bg-blue-50 min-h-screen p-6 rounded-xl m-4 ">
      <h2 className="text-2xl font-bold text-brand-primary mb-1">
        Your Sancatury
      </h2>
      <h1 className="text-xl text-text-muted mb-6">
        {" "}
        Welcome, {state.user?.firstName || "writer"}
      </h1>

      <div className="grid grid-cols-4 gap-4 ">
        <Card icon={<Heart />} description="COMMENTS" />
        <Card icon={<MessageCircle />} description="MESSAGES" />
        <Card icon={<StickyNote />} description="NOTES" />
        <Card icon={<MessageSquareCheck />} description="CHECKS" />
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="text-2xl font-bold">
          <p>Post</p>
          <p> Management</p>
        </div>
        <button
          className="bg-brand-primary text-white hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none rounded-xl cursor-pointer"
          onClick={() => navigator("/editor")}
        >
          New Post
        </button>
      </div>
      <div className="bg-white mt-4 rounded-2xl border border-subtle">
        <HeaderRow />
        {blogs.map((blog) => (
          <BlogRow key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

// still confuse b/w usenavigate and navigate

// const totalPosts = blogs.length;

// const published = blogs.filter(b => b.published).length;

// const totalLikes = blogs.reduce((acc, b) => acc + b.likes, 0);

// const totalComments = blogs.reduce((acc, b) => acc + b.comments, 0);

//📄 Total Posts        → count
// 🚀 Published Posts    → filter(published)
// ❤️ Total Likes        → sum
// 💬 Total Comments     → sum
