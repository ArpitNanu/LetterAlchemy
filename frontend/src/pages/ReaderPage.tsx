import { AiChatbox } from "@/components/Layout/AI/AiChatbox";
import { CommentInput } from "@/components/ui/CommentInput";
import { FocusMode } from "@/components/Reader/FocusMode";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getPublicPostById } from "@/api/postApi";
import { useEditor, EditorContent } from "@tiptap/react";
import { Maximize } from "lucide-react";
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

  const { id } = useParams();
  const hasHydrated = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: null,
  });

  useEffect(() => {
    const postByid = async () => {
      try {
        const res = await getPublicPostById(id);
        if (res.success) {
          setPost(res.data);
        }
      } catch (error) {
        console.error("error while fetching post ", error);
      }
    };
    postByid();
  }, [id]);

  useEffect(() => {
    if (editor && post.content && !hasHydrated.current) {
      editor.commands.setContent(post.content);
      hasHydrated.current = true;
    }
  }, [editor, post.content]);

  return (
    <div className="flex h-full overflow-hidden bg-page-bg">
      {/* Scrollable Reader Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-essay-bg">
        <div className="max-w-3xl mx-auto py-16 px-8 lg:px-12">
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold text-text-main mb-6 leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-text-muted border-b border-border-subtle pb-8">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                {post.author.firstName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-text-main">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-xs uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })} • {post._count.likes} Likes
                </p>
              </div>
            </div>
            <button
              onClick={() => setFocusActive(true)}
              disabled={!editor || !post.content}
              className="
                mt-6 flex items-center gap-2 px-4 py-2 rounded-lg
                bg-brand-primary/10 text-brand-primary text-sm font-medium
                hover:bg-brand-primary/20 transition-colors cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              <Maximize size={16} />
              Focus Mode
            </button>
          </header>

          <article className="tiptap-global mb-20 min-h-[500px]">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            )}
          </article>

          <section className="pt-12 border-t border-border-subtle">
            <h3 className="text-xl font-bold mb-6">Responses ({post._count.comments})</h3>
            <CommentInput />
          </section>
        </div>
      </div>

      {/* AI Sidebar - Sticky within the reader view */}
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

