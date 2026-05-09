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
    <div className="fixed inset-0 z-50 flex flex-col bg-focus-overlay backdrop-blur-3xl animate-in fade-in duration-500">
      {/* ─── TOP BAR ─── */}
      <div className="flex items-center justify-between p-6">
        {/* Exit button - larger for touch */}
        <button
          onClick={onExit}
          className="
            flex items-center gap-2 p-3 -ml-3 text-sm font-bold
            text-text-muted hover:text-text-main
            transition-colors duration-200 cursor-pointer
          "
        >
          <ArrowLeft size={24} />
          <span className="hidden sm:inline">EXIT FOCUS</span>
        </button>

        {/* Progress bar + percentage */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-24 sm:w-40 h-2 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {progress}%
          </span>
        </div>

        {/* Keyboard shortcuts hint - hidden on mobile */}
        <div className="text-xs text-text-muted hidden md:block">
          <span className="border border-border-subtle rounded px-1.5 py-0.5 mr-1 text-[10px]">
            Space
          </span>
          Play/Pause
        </div>
      </div>

      {/* ─── CENTER — THE FOCUS CARD ─── */}
      <div className="flex-1 flex items-center justify-center px-4">
        <FocusModeCard
          before={focusWindow.before}
          current={focusWindow.current}
          after={focusWindow.after}
        />
      </div>

      {/* ─── BOTTOM CONTROLS — TOUCH FRIENDLY ─── */}
      <div className="flex flex-col items-center gap-10 pb-16 px-6">
        
        {/* Main Control Row */}
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {/* Skip Backward */}
          <button
            onClick={skipBackward}
            className="
              w-12 h-12 flex items-center justify-center rounded-full
              text-text-muted hover:text-text-main bg-focus-card border border-border-subtle
              transition-colors cursor-pointer
            "
            aria-label="Skip backward 5 words"
          >
            <ChevronsLeft size={24} />
          </button>

          {/* Play / Pause — Large and Central */}
          <button
            onClick={togglePlay}
            className="
              w-20 h-20 flex items-center justify-center rounded-full
              bg-brand-primary text-white
              shadow-2xl hover:scale-105 active:scale-95
              transition-all duration-200 cursor-pointer
            "
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            className="
              w-12 h-12 flex items-center justify-center rounded-full
              text-text-muted hover:text-text-main bg-focus-card border border-border-subtle
              transition-colors cursor-pointer
            "
            aria-label="Skip forward 5 words"
          >
            <ChevronsRight size={24} />
          </button>
        </div>

        {/* WPM Control Row */}
        <div className="flex items-center bg-focus-card rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <button
            onClick={decreaseWpm}
            className="
              p-5 flex items-center justify-center
              text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5
              transition-colors cursor-pointer
            "
            aria-label="Decrease speed"
          >
            <Minus size={20} />
          </button>
          
          <div className="px-8 text-center min-w-[100px] select-none border-x border-border-subtle/50">
            <div className="text-xl font-bold text-text-main leading-none">{wpm}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest mt-1">WPM</div>
          </div>
          
          <button
            onClick={increaseWpm}
            className="
              p-5 flex items-center justify-center
              text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5
              transition-colors cursor-pointer
            "
            aria-label="Increase speed"
          >
            <Plus size={20} />
          </button>
        </div>

      </div>
    </div>
  );

  // Portal — render into document.body, not inside the component tree
  return createPortal(overlay, document.body);
};
