import { createPortal } from "react-dom";
import { FocusModeCard } from "./FocusModeCard";
import { useFocusEngine } from "./useFocusEngine";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ChevronsLeft, 
  ChevronsRight, 
  Play, 
  Pause 
} from "lucide-react";

type FocusModeProps = {
  /** Plain text content from the article (editor.getText()) */
  text: string;
  /** Callback to close Focus Mode — parent sets focusActive = false */
  onExit: () => void;
};

/**
 * FocusMode — Full-screen RSVP overlay.
 *
 * Rendered via Portal into document.body so it sits above everything.
 * The component is purely visual — all logic lives in useFocusEngine.
 */
export const FocusMode = ({ text, onExit }: FocusModeProps) => {
  const {
    focusWindow,
    isPlaying,
    wpm,
    progress,
    togglePlay,
    skipForward,
    skipBackward,
    increaseWpm,
    decreaseWpm,
  } = useFocusEngine({ text, onExit });

  const overlay = (
    <div className="fixed inset-0 z-50 flex flex-col bg-focus-overlay backdrop-blur-2xl animate-in fade-in duration-300">
      {/* ─── TOP BAR ─── */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Exit button */}
        <button
          onClick={onExit}
          className="
            flex items-center gap-2 text-sm font-medium
            text-text-muted hover:text-text-main
            transition-colors duration-200 cursor-pointer
          "
        >
          <ArrowLeft size={16} />
          EXIT FOCUS
        </button>

        {/* Progress bar + percentage */}
        <div className="flex items-center gap-3">
          <div className="w-40 h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-muted min-w-[36px]">
            {progress}%
          </span>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-text-muted hidden md:block">
          <span className="border border-border-subtle rounded px-1.5 py-0.5 mr-1 text-[10px]">
            Space
          </span>
          Play/Pause
          <span className="ml-3 border border-border-subtle rounded px-1.5 py-0.5 mr-1 text-[10px]">
            Esc
          </span>
          Exit
        </div>
      </div>

      {/* ─── CENTER — THE FOCUS CARD ─── */}
      <div className="flex-1 flex items-center justify-center px-6">
        <FocusModeCard
          before={focusWindow.before}
          current={focusWindow.current}
          after={focusWindow.after}
        />
      </div>

      {/* ─── BOTTOM CONTROLS ─── */}
      <div className="flex items-center justify-center gap-6 px-6 py-6">
        {/* WPM Control */}
        <div className="flex items-center gap-0 bg-focus-card rounded-full border border-border-subtle">
          <button
            onClick={decreaseWpm}
            className="
              w-10 h-10 flex items-center justify-center
              text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5
              rounded-l-full transition-colors cursor-pointer
            "
            aria-label="Decrease speed"
          >
            <Minus size={16} />
          </button>
          <div className="px-3 text-center min-w-[60px] select-none">
            <div className="text-sm font-semibold text-text-main">{wpm}</div>
            <div className="text-[9px] text-text-muted uppercase tracking-widest">WPM</div>
          </div>
          <button
            onClick={increaseWpm}
            className="
              w-10 h-10 flex items-center justify-center
              text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5
              rounded-r-full transition-colors cursor-pointer
            "
            aria-label="Increase speed"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          className="
            w-10 h-10 flex items-center justify-center rounded-full
            text-text-muted hover:text-text-main hover:bg-focus-card
            transition-colors cursor-pointer
          "
          aria-label="Skip backward 5 words"
        >
          <ChevronsLeft size={20} />
        </button>

        {/* Play / Pause — the hero button */}
        <button
          onClick={togglePlay}
          className="
            w-14 h-14 flex items-center justify-center rounded-full
            bg-brand-primary text-white
            shadow-[0_0_30px_rgba(136,168,125,0.3)]
            hover:shadow-[0_0_40px_rgba(136,168,125,0.5)]
            hover:scale-105
            active:scale-95
            transition-all duration-200 cursor-pointer
          "
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          className="
            w-10 h-10 flex items-center justify-center rounded-full
            text-text-muted hover:text-text-main hover:bg-focus-card
            transition-colors cursor-pointer
          "
          aria-label="Skip forward 5 words"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );

  // Portal — render into document.body, not inside the component tree
  return createPortal(overlay, document.body);
};
