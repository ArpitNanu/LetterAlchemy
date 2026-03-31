import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { useEffect, useState } from "react";
import { createDraft, updateDraft } from "@/api/postApi";

export const EditorPage = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setConent] = useState();
  const [draftId, setDraftId] = useState();

  useEffect(() => {
    if (!title.trim()) return;
    const timer = setTimeout(async () => {
      try {
        if (!draftId) {
          const res = await createDraft({ title });
          setDraftId(res.editorid);
        } else {
          await updateDraft(draftId, { title });
        }
      } catch (error) {
        console.error("Autosave failed", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {}, [content]);

  return (
    <div className="bg-white h-full flex items-center justify-center  flex-col m-2">
      <Title value={title} handleTitleChange={setTitle} />
      <EditorMain value={content} handleContentChange={setConent} />
    </div>
  );
};
