import { AiChatbox } from "@/components/AI/AiChatbox";
import { CommentInput } from "@/components/ui/CommentInput";

export const ReaderPage = () => {
  return (
    <div className="grid grid-cols-[1fr_300px] md:grid-cols-[3fr_1fr] gap-4 h-screen">
      <div>
        <h1>Reader Page</h1> <div>authorinformation</div>
        <div>content</div>
        <CommentInput />
      </div>
      <div>
        <AiChatbox />
      </div>
    </div>
  );
};
