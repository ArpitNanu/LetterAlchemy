// EditorPage.tsx
import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { MenuBar } from "@/components/editor/MenuBar";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  createDraft,
  getLatestDraft,
  getPostById,
  updateDraft,
  publishingDraft,
} from "@/api/postApi";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Logo } from "@/components/Logo";

const EMPTY_DOC = {
  type: "doc",
  content: [],
};
export const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Three modes derived from URL shape:
  //   /editor/new   → isNewDraft  (blank editor, no fetch)
  //   /editor/42    → isEditMode  (fetch post #42 by ID)
  //   /editor       → latest draft (old behaviour)
  const isNewDraft = location.pathname === "/editor/new";
  const isEditMode = !!id && id !== "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(EMPTY_DOC);

  const [draftId, setDraftId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [creatingDraft, setCreatingDraft] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Track if we have already loaded the draft into the editor instance
  const hasHydratedEditor = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setContent(editor.getJSON());
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        // Mode 1: /editor/new — blank slate, nothing to fetch
        if (isNewDraft) {
          setIsHydrating(false);
          return;
        }

        // Mode 2: /editor/:id — fetch the specific post the user clicked Edit on
        if (isEditMode && id) {
          const res = await getPostById(id);
          if (!res.success || !res.data) return;

          setTitle(res.data.title || "");
          setContent(res.data.content || EMPTY_DOC);
          setDraftId(res.data.id || null);
          return;
        }

        // Mode 3: /editor — fall back to the user's latest draft
        const res = await getLatestDraft();
        if (!res.success || !res.data) return;

        setTitle(res.data.title || "");
        setContent(res.data.content || EMPTY_DOC);
        setDraftId(res.data.id || null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsHydrating(false);
      }
    };

    fetchDraft();
  }, []);

  // 2. Load the fetched content into Tiptap ONCE
  // We don't want to call setContent on every 'content' state change,
  // because that would reset the user's cursor while typing.
  useEffect(() => {
    if (editor && !isHydrating && !hasHydratedEditor.current) {
      if (content && content.content && content.content.length > 0) {
        editor.commands.setContent(content);
      }
      hasHydratedEditor.current = true;
    }
  }, [editor, isHydrating, content]);
  // 3. Handle Publishing
  const handlePublished = async () => {
    if (!draftId) return;
    setPublishing(true);
    try {
      // Important: Save the latest content immediately before publishing
      // to ensure the 500ms debounce doesn't miss the last keystroke.
      await updateDraft(draftId, { title, content });

      // Perform the publish action. The backend now returns the generated slug!
      const publishRes = await publishingDraft(draftId);

      if (publishRes.success && publishRes.data.slug) {
        // Redirect to the new human-readable slug URL
        navigate(`/post/${publishRes.data.slug}`);
      } else {
        // Fallback to ID if something goes wrong with the slug
        navigate(`/post/${draftId}`);
      }
    } catch (error) {
      console.error("Publishing failed:", error);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (isHydrating) return;

    if (publishing) return;

    const isContentEmpty =
      !content || !content.content || content.content.length === 0;

    // Only skip auto-save if BOTH title AND content are empty
    if (!title.trim() && isContentEmpty) return;

    // As soon as changes are detected, we can indicate that saving will happen soon
    // Or we can wait for the actual request. Let's indicate "Saving..." when the request starts.

    const timeout = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        // Always send safe content (never null)

        const safeContent = content && content.content ? content : EMPTY_DOC;

        if (!draftId && !creatingDraft) {
          setCreatingDraft(true);

          const res = await createDraft({ title, content: safeContent });
          setDraftId(res.data.id);

          setCreatingDraft(false);
          setSaveStatus("saved");
          navigate("/editor", { replace: true });
        } else if (draftId) {
          await updateDraft(draftId, { title, content: safeContent });
          setSaveStatus("saved");
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, content, draftId]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="min-h-screen bg-white md:bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20 bg-white/95 md:bg-gray-50/95 backdrop-blur-sm py-3 px-1 border-b border-gray-100 md:border-none">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Logo className="w-5 h-5 text-brand-primary shrink-0" />
              <div className="overflow-x-auto no-scrollbar flex-1">
                <MenuBar />
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="text-[10px] md:text-xs text-gray-400 font-medium min-w-[70px]">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Draft saved"}
                {saveStatus === "error" && "Save failed"}
              </span>
              <Button
                className="cursor-pointer bg-brand-highlight border-brand-primary text-black text-sm md:text-md hover:bg-brand-primary hover:text-green-50 disabled:cursor-not-allowed px-6 rounded-full"
                onClick={handlePublished}
                disabled={publishing}
              >
                Publish
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Title value={title} handleTitleChange={setTitle} />
            <EditorMain editor={editor} />
          </div>

          <div className="mt-6 flex justify-end"></div>
        </div>
      </div>
    </EditorContext.Provider>
  );
};

