import { useState } from "react";
import { Send } from "lucide-react";

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export const CommentInput = ({ onSubmit }: CommentInputProps) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          className="
            w-full p-4 rounded-2xl border border-border-subtle bg-surface/50
            placeholder:text-text-muted text-text-main text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
            transition-all duration-200 resize-none min-h-[120px]
          "
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add to the discussion..."
          maxLength={500}
        />
        
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
            {text.length} / 500 characters
          </span>
          
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-brand-primary text-white text-sm font-bold
              hover:bg-brand-primary/90 transition-all cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-brand-primary/20
            "
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};
