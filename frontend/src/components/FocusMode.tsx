import { useEffect, useState } from "react";
import { boolean } from "zod";
const givenstring =
  "Durable Objects present a simpler paradigm: write a JavaScript class";

const words = givenstring.split(/\s+/).filter(boolean);

export const FocusMode = () => {
  const [focusmode, setFocusmode] = useState(false);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => {
      if (!focusmode) return;
      setIndex((prev) => {
        if (prev >= words.length - 1) return prev; //for last word check
        return prev + 1;
      });
    }, 500);
    if (index >= words.length - 1) {
      setFocusmode(false);
    }
    return () => clearTimeout(id); // clear old timer
  }, [focusmode, index]);
  return (
    <div>
      <button
        className="cursor-pointer"
        onClick={() => setFocusmode(!focusmode)}
      >
        focusmode/stop
      </button>
      <div>{words[index]}</div>
    </div>
  );
};
