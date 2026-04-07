import { Title } from "@/components/editor/Title";
import EditorMain from "../components/editor/EditorMain";
import { useEffect, useState } from "react";
import {
  createDraft,
  getLatestDraft,
  updateDraft,
  publishingDraft,
} from "@/api/postApi";
import { Button } from "@/components/ui/button";

export const EditorPage = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setConent] = useState<any>(null);
  const [draftId, setDraftId] = useState<number | any>(null);
  const [creatingDraft, isCreatingDraft] = useState<boolean>(false);
  const [ishydrating, setIshydrating] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);

  useEffect(() => {
    const latestPost = async () => {
      try {
        const res = await getLatestDraft();
        if (!res.success || !res.data || !res.id) return;
        else setTitle(res.data.title);
        setConent(res.data.content);
        setDraftId(res.id);
      } catch (error) {
        console.error("Latest draft fetch failed", error);
      } finally {
        setIshydrating(false);
      }
    };
    //“React lifecycle is sync → my work is async → I bridge them”
    latestPost();
  }, []);

  const handlePublished = async () => {
    setPublishing(true);
    try {
      const reponse = await publishingDraft(draftId);
      
    } catch (error) {
      console.error("Unable to publish the draft", error);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (ishydrating) return;
    if (!title.trim() && !content) return;
    if (publishing) return;

    const autosave = setTimeout(async () => {
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
        console.error("Autosave stop", error);
      }
    }, 500);
    return () => clearTimeout(autosave);
  }, [title, content]);

  return (
    <div className="bg-white h-full flex items-center justify-center  flex-col m-2">
      <Title value={title} handleTitleChange={setTitle} />
      <EditorMain value={content} handleContentChange={setConent} />
      <Button onClick={handlePublished}>Publish</Button>
    </div>
  );
};
