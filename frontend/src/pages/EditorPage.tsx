// EditorPage.tsx
import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { MenuBar } from "@/components/editor/MenuBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  createDraft,
  getLatestDraft,
  updateDraft,
  publishingDraft,
} from "@/api/postApi";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const EMPTY_DOC = {
  type: "doc",
  content: [],
};
export const EditorPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(EMPTY_DOC);

  const [draftId, setDraftId] = useState<number | null>(null);

  const [creatingDraft, setCreatingDraft] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [publishing, setPublishing] = useState(false);

 // Track if we have already loaded the draft into the editor instance
  const hasHydratedEditor = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: EMPTY_DOC,
    onUpdate({ editor }) {
      setContent(editor.getJSON());
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await getLatestDraft();

        if (!res.success || !res.data) return;

        setTitle(res.data.title || "");

        const incomingContent = res.data.content || EMPTY_DOC;
        setContent(incomingContent);

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
      
      // Perform the publish action
      await publishingDraft(draftId);
      navigate(`/post/${draftId}`);
    } catch (error) {
      console.error("Publishing failed:", error);
    } finally {
      setPublishing(false);
    }
  };


  useEffect(() => {
    if (isHydrating) return;

    if (publishing) return;

    const isContentEmpty = !content || content.content.length === 0;

    if (!title.trim() && !isContentEmpty) return;

    const timeout = setTimeout(async () => {
      try {
        // Always send safe content (never null)

        const safeContent = content && content.content ? content : EMPTY_DOC;

        if (!draftId && !creatingDraft) {
          setCreatingDraft(true);

          const res = await createDraft({ title, content: safeContent });
          setDraftId(res.data.id);

          setCreatingDraft(false);
        } else if (draftId) {
          await updateDraft(draftId, { title, content: safeContent });
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, content, draftId]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 pt-10 space-y-4">
          <div className="flex justify-center mb-4 sticky top-0 z-10 bg-gray-50 py-2">
            <MenuBar />
          </div>

          <Title value={title} handleTitleChange={setTitle} />

          <EditorMain editor={editor} />

          <div className="mt-6 flex justify-end">
            <Button
              className=" cursor-pointer"
              onClick={handlePublished}
              disabled={publishing}
            >
              Publish
            </Button>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
};
