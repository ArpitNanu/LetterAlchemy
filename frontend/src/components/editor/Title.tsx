import { useRef, useEffect } from "react";

type Props = {
  value: string;
  handleTitleChange: (value: string) => void;
};

export const Title = ({ value, handleTitleChange }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="mb-6">
      <textarea
        ref={textareaRef}
        rows={1}
        className="w-full text-5xl font-bold leading-tight outline-none resize-none bg-transparent placeholder-gray-400 overflow-hidden"
        value={value}
        id="myinput"
        placeholder="Title"
        onChange={(e) => handleTitleChange(e.target.value)}
      />
    </div>
  );
};
