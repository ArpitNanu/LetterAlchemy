import { Bot, SparkleIcon } from "lucide-react";
import { SparkAi } from "../ui/SparkAi";

export const AiChatbox = () => {
  return (
    <div className="bg-sidebar-bg border border-border-subtle rounded-md p-4 h-full">
      <div className="flex gap-1">
        <Bot />
        <p>Alchemist AI </p>
      </div>
      <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md border border-border-subtle flex items-center gap-1 mt-4 cursor-pointer">
        <SparkAi />
        <button className="text-[#4A6741]">Summarize the article</button>
      </div>
    </div>
  );
};
