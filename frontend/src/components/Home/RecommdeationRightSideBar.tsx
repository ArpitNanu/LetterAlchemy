import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { getAiPrompts } from "../../api/postApi";

export const RecommdeationRightSideBar = () => {
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    // LAYER 2: Fetching the data from your new promptAi route
    const fetchPrompts = async () => {
      try {
        const response = await getAiPrompts();
        if (response.success && response.data.prompt) {
          // Let's show up to 15 prompts now!
          const topHeadlines = response.data.prompt.slice(0, 15);
          
          // Extract the first prompt from each headline's JSON array
          const extractedPrompts = topHeadlines
            .map((h: any) => {
              try {
                const parsedArray = JSON.parse(h.text);
                return parsedArray[0]; // Grab the first prompt out of the 3
              } catch (e) {
                return null;
              }
            })
            .filter(Boolean); // Remove any nulls if parsing failed

          setPrompts(extractedPrompts);
        }
      } catch (error) {
        console.error("Failed to fetch prompts", error);
      }
    };

    fetchPrompts();
  }, []);

  return (
    <div className="bg-[#EEF5F7] border-l border-border-subtle h-full p-6 flex flex-col">
      {/* STICKY HEADER AREA */}
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Logo className="w-5 h-5 text-brand-primary" />
          <h2 className="text-text-primary font-bold text-sm">Alchemist AI</h2>
        </div>
        <p className="text-text-muted text-xs mb-8">
          Spark inspiration for your next masterpiece.
        </p>

        <h3 className="text-text-muted text-[10px] font-bold tracking-wider mb-4 uppercase">
          Writing Prompts
        </h3>
      </div>
        
      {/* SCROLLABLE PROMPTS AREA */}
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pb-10 pr-2">
          {prompts.map((prompt, index) => (
            <div 
              key={index} 
              className="bg-white border border-border-subtle p-4 rounded-md shadow-sm cursor-pointer hover:border-brand-primary hover:shadow-md transition-all"
            >
              <p className="font-serif italic text-text-primary text-sm leading-relaxed">
                "{prompt}"
              </p>
            </div>
          ))}
          
          {/* Skeleton loading state while fetching */}
          {prompts.length === 0 && (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-24 bg-gray-200 rounded-md w-full"></div>
              <div className="h-24 bg-gray-200 rounded-md w-full"></div>
            </div>
          )}
        </div>
    </div>
  );
};
