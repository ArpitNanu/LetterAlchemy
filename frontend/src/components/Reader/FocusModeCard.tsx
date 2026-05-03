type Props = {
  before: string[];
  current: string;
  after: string[];
};

/**
 * FocusModeCard — The glassmorphic card that displays the sliding window.
 *
 * Layout from the design: VERTICAL stack
 *   - Before words (top row, muted)
 *   - Current word (center, large, brand green)
 *   - After words (bottom row, muted)
 *
 * The card uses backdrop-filter for the frosted glass effect.
 */
export const FocusModeCard = ({ before, current, after }: Props) => {
  return (
    <div
      className="
        relative mx-auto w-full max-w-2xl
        rounded-2xl border border-border-subtle
        bg-focus-card backdrop-blur-xl
        px-12 py-14
        shadow-[0_8px_60px_rgba(0,0,0,0.15)]
        dark:shadow-[0_8px_60px_rgba(0,0,0,0.4)]
      "
    >
      {/* Before words — top row */}
      <div className="flex items-center justify-center gap-3 mb-6 text-sm tracking-[0.25em] text-focus-muted font-light select-none">
        {before.map((word, i) => (
          <span key={`before-${i}`} className="transition-opacity duration-300">
            {word}
          </span>
        ))}
      </div>

      {/* Current word — the hero */}
      <div className="flex items-center justify-center py-4 text-center">
        <span
          className="
            text-5xl md:text-6xl font-serif font-semibold
            text-brand-primary
            transition-all duration-200 ease-out
            select-none
          "
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {current}
        </span>
      </div>

      {/* After words — bottom row */}
      <div className="flex items-center justify-center gap-3 mt-6 text-sm tracking-[0.25em] text-focus-muted font-light select-none">
        {after.map((word, i) => (
          <span key={`after-${i}`} className="transition-opacity duration-300">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};
