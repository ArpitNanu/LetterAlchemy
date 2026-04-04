import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { useEffect, useState } from "react";
import { createDraft, getLatestDraft, updateDraft } from "@/api/postApi";

export const EditorPage = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setConent] = useState<any>(null);
  const [draftId, setDraftId] = useState<number | any>(null);
  const [creatingDraft, isCreatingDraft] = useState<boolean>(false);
  const [ishydrating, setIshydrating] = useState<boolean>(true);

  useEffect(() => {
    const latestPost = async () => {
      try {
        const res = await getLatestDraft();
        if (!res.success || !res.data) return;
        setTitle(res.data.title);
        setConent(res.data.content);
      } catch (error) {
        console.error("Latest draft fetch failed", error);
      } finally {
        setIshydrating(!ishydrating);
      }
    };
    latestPost();
    //“React lifecycle is sync → my work is async → I bridge them”
  });

  useEffect(() => {
    if (ishydrating) return;
    if (!title.trim() && !content) return;

    const timer = setTimeout(async () => {
      try {
        if (!draftId && !creatingDraft) {
          isCreatingDraft(true);

          const res = await createDraft({ title, content });
          setDraftId(res.id);

          isCreatingDraft(false);
        } else if (draftId) {
          await updateDraft(draftId, { title, content });
        }
      } catch (error) {
        console.error("Autosave failed", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, content]);

  return (
    <div className="bg-white h-full flex items-center justify-center  flex-col m-2">
      <Title value={title} handleTitleChange={setTitle} />
      <EditorMain value={content} handleContentChange={setConent} />
    </div>
  );
};
