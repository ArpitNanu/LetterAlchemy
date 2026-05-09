import { AiChatbox } from "@/components/Layout/AI/AiChatbox";
import { CommentInput } from "@/components/ui/CommentInput";
import { CommentList } from "@/components/ui/CommentList";
import { FocusMode } from "@/components/Reader/FocusMode";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// getPublicPostBySlug is our NEW API function.
// The old getPublicPostById looked up posts by their numeric DB ID.
// Now we look up by the human-readable slug string instead.
import { getPublicPostBySlug } from "@/api/postApi";
import { getComments, createComment, deleteComment } from "@/api/commentApi";
import { useAuth } from "@/context/AuthContext";
import { useEditor, EditorContent } from "@tiptap/react";
import { Maximize, MessageSquare } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";

export const ReaderPage = () => {
  const [focusActive, setFocusActive] = useState(false);
  const [post, setPost] = useState({
    id: 0,
    title: "",
    content: null,
    createdAt: "",
    author: {
      id: 0,
      firstName: "",
      lastName: "",
    },
    _count: {
      likes: 0,
      comments: 0,
    },
  });
  const [comments, setComments] = useState<any[]>([]);
  const { state: authState } = useAuth();

  // useParams() reads the dynamic segment from the current URL.
  // Our route is defined as /post/:slug in App.tsx.
  // So for URL /post/my-first-post, this gives us: { slug: "my-first-post" }
  // We destructure 'slug' — this name MUST match the :slug in App.tsx.
  const { slug } = useParams();
  const hasHydrated = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: null,
  });

  useEffect(() => {
    const postBySlug = async () => {
      try {
        // Call the NEW API function with the slug string from the URL.
        // e.g., if URL is /post/my-first-post, slug = "my-first-post"
        const res = await getPublicPostBySlug(slug);
        if (res.success) {
          setPost(res.data);
          // NOTE: After this setPost, post.id is now populated with the
          // REAL numeric DB id. We use this id for comments below,
          // because the comment API still works with numeric post IDs.
        }
      } catch (error) {
        console.error("error while fetching post ", error);
      }
    };
    postBySlug();
  // Re-run this effect whenever the slug in the URL changes.
  // This handles navigating directly between /post/slug-a and /post/slug-b.
  }, [slug]);

  useEffect(() => {
    const fetchComments = async () => {
      // post.id is the numeric DB id populated after the post fetch above.
      // We wait for it to be non-zero before fetching comments.
      // This prevents calling getComments(0) on first render before the post loads.
      if (!post.id) return;
      const res = await getComments(post.id);
      if (res.success) {
        setComments(res.data);
      }
    };
    fetchComments();
  // Depend on post.id — this effect runs AFTER the post is loaded.
  }, [post.id]);

  const handleCommentSubmit = async (text: string) => {
    // post.id is available from state after the post has loaded.
    // No need to parse from the URL anymore — the slug URL has no number in it.
    if (!post.id) return;
    const res = await createComment(post.id, text);
    if (res.success) {
      setComments((prev) => [res.data, ...prev]);
      setPost((prev) => ({
        ...prev,
        _count: { ...prev._count, comments: prev._count.comments + 1 },
      }));
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    const res = await deleteComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) => ({
        ...prev,
        _count: { ...prev._count, comments: Math.max(0, prev._count.comments - 1) },
      }));
    }
  };

  useEffect(() => {
    if (editor && post.content && !hasHydrated.current) {
      editor.commands.setContent(post.content);
      hasHydrated.current = true;
    }
  }, [editor, post.content]);

  return (
    <div className="flex h-screen overflow-hidden bg-page-bg">
      {/* Scrollable Reader Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-essay-bg">
        <div className="max-w-3xl mx-auto py-10 md:py-16 px-5 md:px-12">
          <header className="mb-10 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-6 leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-text-muted border-b border-border-subtle pb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shrink-0">
                {post.author.firstName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-main truncate">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-[10px] md:text-xs uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })} • {post._count.likes} Likes
                </p>
              </div>
            </div>
            <button
              onClick={() => setFocusActive(true)}
              disabled={!editor || !post.content}
              className="
                mt-8 flex items-center gap-2 px-6 py-3 rounded-xl
                bg-brand-primary/10 text-brand-primary text-sm font-bold
                hover:bg-brand-primary/20 transition-all cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center
              "
            >
              <Maximize size={18} />
              Focus Mode
            </button>
          </header>

          <article className="tiptap-global mb-20 min-h-[400px] text-lg leading-relaxed">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            )}
          </article>

          <section className="pt-12 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-text-main">
                Responses <span className="text-text-muted font-normal ml-1">({post._count.comments})</span>
              </h3>
            </div>
            
            <CommentInput onSubmit={handleCommentSubmit} />
            
            <CommentList 
              comments={comments} 
              currentUserId={authState.user?.id ? Number(authState.user.id) : undefined}
              onDelete={handleCommentDelete}
            />
          </section>
        </div>
      </div>

      {/* AI Sidebar - Hidden on mobile/tablet, shown on desktop */}
      <aside className="w-[350px] hidden xl:block border-l border-border-subtle bg-sidebar-bg/30 p-6 overflow-y-auto">
        <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">Live Context</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            I'm currently analyzing this article. Ask me for a summary, key takeaways, or to explore the author's tone.
          </p>
          <AiChatbox />
        </div>
      </aside>

      {/* Focus Mode Overlay — rendered via Portal */}
      {focusActive && editor && (
        <FocusMode
          text={editor.getText()}
          onExit={() => setFocusActive(false)}
        />
      )}
    </div>
  );
};

