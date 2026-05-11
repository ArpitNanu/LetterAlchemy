import { getPublicPost } from "@/api/postApi";
import { RecommdeationRightSideBar } from "@/components/Home/RecommdeationRightSideBar";
import PostCard from "@/components/ui/PostCard";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const [post, setPost] = useState([]);
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const publicPost = async () => {
      try {
        const res = await getPublicPost();
        if (!res.success) return;
        setPost(res.data);
      } catch (error) {
        console.error("Failed to fetch public posts:", error);
      }
    };
    publicPost();
  }, []);

  const handleGuestLogin = async () => {
    const guestEmail = "demo@example.com";
    const guestPassword = "password123";

    dispatch({ type: "LOGIN_START" });
    try {
      const data = await login({ email: guestEmail, password: guestPassword });
      dispatch({
        type: "LOGIN-SUCCESS",
        payload: {
          user: data.user,
          token: data.token,
        },
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Guest login failed");
      dispatch({ type: "LOGIN_FAILED", payload: "Guest login failed" });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* GUEST ACCESS BANNER */}
      {!state.user && (
        <div className="bg-brand-primary/5 border-b border-brand-primary/10 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <span className="text-brand-primary text-xs font-bold">✨</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">Welcome Reviewer!</p>
              <p className="text-[11px] text-text-muted font-medium">Explore the full power of LetterAlchemy instantly.</p>
            </div>
          </div>
          <button
            onClick={handleGuestLogin}
            disabled={state.isLoading}
            className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-brand-highlight transition-all shadow-sm flex items-center gap-2"
          >
            {state.isLoading ? "Entering..." : "Try Demo Access"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] flex-1 overflow-hidden">
        <div className="overflow-y-auto px-4 md:px-6 md:pr-2 pb-10 pt-4">
          <PostCard posts={post} />
        </div>
        <aside className="hidden lg:block overflow-hidden border-l border-border-subtle">
          <RecommdeationRightSideBar />
        </aside>
      </div>
    </div>
  );
};
