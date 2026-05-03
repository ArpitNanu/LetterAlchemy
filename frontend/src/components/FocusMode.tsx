import { useEffect, useState } from "react";
const givenstring =
  "Durable Objects present a simpler paradigm: write a JavaScript class";

const words = givenstring.split(/\s+/).filter(boolean);

export const FocusMode = () => {
  const [focusmode, setFocusmode] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!focusmode) return;
    const id = setTimeout(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) return prev; //for last word check
        return prev + 1;
      });
    }, 500);

    return () => clearTimeout(id); // clear old timer
  }, [focusmode, index]);

  useEffect(() => {
    if (index >= words.length - 1) {
      setFocusmode(false);
      //setIndex(0);
    }
  }, [index, focusmode]);

  const handleFocsMode = () => {
    if (index >= words.length - 1) {
      setIndex(0);
    }
    setFocusmode((prev) => !prev);
  };

  return (
    <div>
      <button className="cursor-pointer" onClick={handleFocsMode}>
        focusmode/stop
      </button>
      <div>{words[index]}</div>
    </div>
  );
};
