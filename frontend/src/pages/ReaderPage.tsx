import { AiChatbox } from "@/components/AI/AiChatbox";
import { CommentInput } from "@/components/ui/CommentInput";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getPublicPostById } from "@/api/postApi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const ReaderPage = () => {
  const [post, setPost] = useState({
    id: 0,
    title: "",
    content: null, // tiptap content is stored in json format 
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

  // Initialize TipTap in read-only mode
  const editor = useEditor({
    extensions: [StarterKit],
    editable: false, // This is what makes it a "Reader"
    content: null,
    editorProps: {
      attributes: {
        class: "focus:outline-none", // add custom tailwind classes for editor container
      },
    },
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

  // Hydrate the editor when content is fetched
  useEffect(() => {
    if (editor && post.content && !hasHydrated.current) {
      editor.commands.setContent(post.content);
      hasHydrated.current = true;
    }
  }, [editor, post.content]);

  return (
    <div className="grid grid-cols-[1fr_300px] md:grid-cols-[3fr_1fr] gap-4 h-screen p-8">
      <div className="max-w-3xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-muted-foreground gap-2">
            <span>By {post.author.firstName} {post.author.lastName}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <article className="prose prose-neutral dark:prose-invert lg:prose-xl max-w-none">
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="text-lg leading-relaxed text-gray-400">
              Loading content...
            </div>
          )}
        </article>

        <div className="mt-12 pt-8 border-t">
          <CommentInput />
        </div>
      </div>
      
      <aside className="border-l pl-4">
        <AiChatbox />
      </aside>
    </div>
  );
};
