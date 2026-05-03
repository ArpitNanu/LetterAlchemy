import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Sliding Window — returns 3 words before, the current word, and 3 words after.
 * The || "" handles edge cases at the start/end of the array gracefully.
 */
function getWindow(words: string[], index: number) {
  return {
    before: [
      words[index - 3] || "",
      words[index - 2] || "",
      words[index - 1] || "",
    ],
    current: words[index] || "",
    after: [
      words[index + 1] || "",
      words[index + 2] || "",
      words[index + 3] || "",
    ],
  };
}

type UseFocusEngineProps = {
  text: string;
  onExit: () => void;
};

export function useFocusEngine({ text, onExit }: UseFocusEngineProps) {
  // --- Static data (useRef — no re-renders when set) ---
  const wordsRef = useRef<string[]>([]);

  // --- Reactive state (useState — triggers re-renders for UI) ---
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(200);

  // Parse words once when text changes
  useEffect(() => {
    wordsRef.current = text.split(/\s+/).filter(Boolean);
    setIndex(0);
    setIsPlaying(false);
  }, [text]);

  const words = wordsRef.current;
  const totalWords = words.length;
  const delay = 60000 / wpm; // WPM → milliseconds

  // --- The Timer Engine (Recursive setTimeout) ---
  useEffect(() => {
    if (!isPlaying || totalWords === 0) return;

    const id = setTimeout(() => {
      setIndex((prev) => {
        if (prev >= totalWords - 1) return prev;
        return prev + 1;
      });
    }, delay);

    return () => clearTimeout(id);
  }, [isPlaying, index, delay, totalWords]);

  // --- Stop at end ---
  useEffect(() => {
    if (isPlaying && index >= totalWords - 1 && totalWords > 0) {
      setIsPlaying(false);
    }
  }, [index, isPlaying, totalWords]);

  // --- Controls ---
  const togglePlay = useCallback(() => {
    if (index >= totalWords - 1 && totalWords > 0) {
      setIndex(0); // restart from beginning
    }
    setIsPlaying((prev) => !prev);
  }, [index, totalWords]);

  const skipForward = useCallback(() => {
    setIndex((prev) => Math.min(prev + 5, totalWords - 1));
  }, [totalWords]);

  const skipBackward = useCallback(() => {
    setIndex((prev) => Math.max(prev - 5, 0));
  }, []);

  const increaseWpm = useCallback(() => {
    setWpm((prev) => Math.min(prev + 50, 600));
  }, []);

  const decreaseWpm = useCallback(() => {
    setWpm((prev) => Math.max(prev - 50, 50));
  }, []);

  // --- Keyboard Hotkeys ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // prevent page scroll
        togglePlay();
      }
      if (e.code === "Escape") {
        onExit();
      }
      if (e.code === "ArrowRight") {
        skipForward();
      }
      if (e.code === "ArrowLeft") {
        skipBackward();
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        increaseWpm();
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        decreaseWpm();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, onExit, skipForward, skipBackward, increaseWpm, decreaseWpm]);

  // --- Derived state ---
  const focusWindow = getWindow(words, index);
  const progress = totalWords > 0 ? Math.round((index / (totalWords - 1)) * 100) : 0;

  return {
    focusWindow,
    index,
    totalWords,
    isPlaying,
    wpm,
    progress,
    togglePlay,
    skipForward,
    skipBackward,
    increaseWpm,
    decreaseWpm,
  };
}
