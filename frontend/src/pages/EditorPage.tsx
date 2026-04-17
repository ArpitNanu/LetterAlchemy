import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { MenuBar } from "@/components/editor/MenuBar";

import { useEffect, useMemo, useState } from "react";
import {
  createDraft,
  getLatestDraft,
  updateDraft,
  publishingDraft,
} from "@/api/postApi";

import { Button } from "@/components/ui/button";

import { useEditor, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const EditorPage = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setConent] = useState<any>(null);
  const [draftId, setDraftId] = useState<number | null>(null);

  const [creatingDraft, setCreatingDraft] = useState<boolean>(false);
  const [ishydrating, setIshydrating] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p></p>",

    onUpdate({ editor }) {
      setConent(editor.getJSON());
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  // Hydration
  useEffect(() => {
    const latestPost = async () => {
      try {
        const res = await getLatestDraft();
        if (!res.success || !res.data || !res.id) return;

        setTitle(res.data.title);
        setConent(res.data.content);
        setDraftId(res.id);
      } catch (error) {
        console.error("Latest draft fetch failed", error);
      } finally {
        setIshydrating(false);
      }
    };

    latestPost();
  }, []);

  // Publish
  const handlePublished = async () => {
    if (!draftId) return;
    setPublishing(true);
    try {
      await publishingDraft(draftId);
    } catch (error) {
      console.error("Unable to publish the draft", error);
    } finally {
      setPublishing(false);
    }
  };

  // Autosave
  useEffect(() => {
    if (ishydrating) return;
    if (!title.trim() && !content) return;
    if (publishing) return;

    const autosave = setTimeout(async () => {
      try {
        if (!draftId && !creatingDraft) {
          setCreatingDraft(true);

          const res = await createDraft({ title, content });
          setDraftId(res.id);

          setCreatingDraft(false);
        } else if (draftId) {
          await updateDraft(draftId, { title, content });
        }
      } catch (error) {
        console.error("Autosave stop", error);
      }
    }, 500);

    return () => clearTimeout(autosave);
  }, [title, content]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 pt-10 space-y-4">
          <div className="flex justify-center mb-4 sticky top-0 z-10 bg-gray-50 py-2">
            <MenuBar />
          </div>

          <div className="mb-2">
            <Title value={title} handleTitleChange={setTitle} />
          </div>
          <div>
            <EditorMain editor={editor} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handlePublished} disabled={publishing}>
              Publish
            </Button>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
};
