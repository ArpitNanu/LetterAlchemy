# LetterAlchemy — Feature Planning

> **Status:** Pre-implementation planning document  
> **Features:** Focus / Writing Mode + AI Gradient Text Differentiation

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Feasibility Assessment](#feasibility-assessment)
3. [Feature 1 — Focus / Writing Mode](#feature-1--focus--writing-mode)
   - [What it does](#what-it-does)
   - [How TipTap fits in](#how-tiptap-fits-in---focus-mode)
   - [State Design](#state-design---focus-mode)
   - [Implementation Flowchart](#implementation-flowchart---focus-mode)
   - [CSS Strategy](#css-strategy---focus-mode)
4. [Feature 2 — AI Gradient Text](#feature-2--ai-gradient-text)
   - [What it does](#what-it-does-1)
   - [How TipTap fits in](#how-tiptap-fits-in---ai-gradient-text)
   - [State Design](#state-design---ai-gradient-text)
   - [Implementation Flowchart](#implementation-flowchart---ai-gradient-text)
   - [The Custom Mark](#the-custom-mark)
5. [Interaction Between the Two Features](#interaction-between-the-two-features)
6. [Files You Will Touch](#files-you-will-touch)
7. [Open Questions Before Building](#open-questions-before-building)

---

## Feature Overview

| # | Feature | Trigger | Visual Effect |
|---|---------|---------|---------------|
| 1 | **Focus / Writing Mode** | User clicks "Focus" toggle OR editor gains focus | Only the active paragraph is fully visible; all others fade/blur; non-active paragraphs show 1–2 truncated lines |
| 2 | **AI Gradient Text** | User selects text → clicks "Edit by AI" → AI response replaces/inserts text | AI-generated text renders with a colour gradient; human-typed text stays plain black |

---

## Feasibility Assessment

### ✅ Both features are fully feasible with your current stack.

Here is why:

| Concern | Your Current Setup | Verdict |
|---------|-------------------|---------|
| TipTap version | `@tiptap/react@^3.x` — latest, has `useEditorState` | ✅ Supports custom extensions + decorations |
| React version | React 19 | ✅ No blockers |
| Custom Marks | TipTap `Mark` API is first-class | ✅ `AITextMark` is straightforward |
| CSS blur/fade effect | Tailwind 4 + Vanilla CSS available | ✅ `backdrop-filter` / `opacity` transition works |
| Editor paragraph tracking | TipTap exposes `$anchor.parent` and ProseMirror decorations | ✅ Can detect active node |
| State management | Currently local `useState` in `EditorPage` | ✅ A `focusMode` boolean is all you need |
| Auto-save interaction | Content is saved as TipTap JSON (`getJSON()`) | ✅ Custom marks serialize into JSON, persist correctly |

---

## Feature 1 — Focus / Writing Mode

### What it does

- Editor enters a distraction-free mode
- **Active paragraph** (where cursor is) = full opacity, full readable text
- **All other paragraphs** = blurred, reduced opacity, only showing ~1–2 lines worth of height (overflow hidden)
- Smooth CSS transition as cursor moves between paragraphs

### How TipTap fits in — Focus Mode

TipTap wraps ProseMirror. Each `<p>` block in your document becomes a DOM `<p>` element inside `.ProseMirror`. You can:

1. **Track the active node position** using `editor.state.selection.$anchor.start()` (gives you the position of the start of the block the cursor is in).
2. **Use ProseMirror Decorations** to stamp a CSS class (e.g. `is-active-paragraph`) onto only the block that contains the cursor.
3. The CSS then does the rest — blur + fade everything that does NOT have `is-active-paragraph`.

> **Why Decorations over DOM manipulation?**  
> TipTap re-renders the editor view on every state change. Direct DOM manipulation gets wiped. Decorations are the TipTap-sanctioned way to add ephemeral, non-persistent visual metadata to nodes.

### State Design — Focus Mode

```
EditorPage (or a new FocusModeProvider)
│
├── focusMode: boolean            ← toggled by user
│                                    (stored in useState, NOT in editor content)
│
├── activeParagraphPos: number    ← updated on every selection change via
│   (optional)                       editor.on('selectionUpdate', ...)
│
└── Editor extensions
    └── FocusModeDecoration       ← custom TipTap Extension that reads
        (Plugin)                      focusMode flag and stamps .is-active
                                      onto the current node via DecorationSet
```

**Key insight:** `focusMode` is a React state flag. It does **not** go into TipTap's document JSON. It is ephemeral UI state. The decoration plugin reads this flag.

### Implementation Flowchart — Focus Mode

```
User clicks "Focus Mode" toggle
        │
        ▼
setFocusMode(true)  ──────────────────────────────────────────────────────┐
        │                                                                   │
        ▼                                                                   │
Editor's selectionUpdate fires on every cursor move                        │
        │                                                                   │
        ▼                                                                   │
FocusModePlugin.apply()                                                    │
  ├─ If focusMode === false → return DecorationSet.empty                   │
  └─ If focusMode === true                                                 │
        │                                                                   │
        ▼                                                                   │
  state.doc.nodesBetween(0, doc.content.size)                              │
  Find block node that CONTAINS $anchor.pos                                │
        │                                                                   │
        ▼                                                                   │
  Create Decoration.node(nodeStart, nodeEnd,                               │
    { class: "is-active-paragraph" })                                      │
        │                                                                   │
        ▼                                                                   │
  All other block nodes get class "is-inactive-paragraph"                  │
        │                                                                   │
        ▼                                                                   │
  CSS transition handles blur + opacity smoothly  ◄─────────────────────────┘
        │
        ▼
User clicks "Focus Mode" toggle again
        │
        ▼
setFocusMode(false) → DecorationSet.empty → all paragraphs restore
```

### CSS Strategy — Focus Mode

```css
/* Applied to the editor wrapper when focusMode is active */
.focus-mode-active .ProseMirror p,
.focus-mode-active .ProseMirror h1,
.focus-mode-active .ProseMirror h2 {
  /* default inactive state */
  opacity: 0.25;
  filter: blur(1.5px);
  max-height: 2.8em;          /* show ~1-2 lines */
  overflow: hidden;
  transition: opacity 300ms ease, filter 300ms ease, max-height 300ms ease;
}

/* The active paragraph - overrides the above */
.focus-mode-active .is-active-paragraph {
  opacity: 1;
  filter: blur(0);
  max-height: none;           /* unconstrained */
}
```

> **Tip:** Add `.focus-mode-active` class to the editor wrapper `<div>` when `focusMode === true`. This scopes all CSS and avoids leaking styles.

---

## Feature 2 — AI Gradient Text

### What it does

- User selects a portion of text in the editor
- Clicks "Edit by AI" (in the BubbleMenu or elsewhere)
- AI generates replacement/enhanced text
- That AI-generated text is inserted into the document with a special **mark** applied
- The mark renders the text with a gradient colour (e.g. cyan → purple, matching the iA Writer aesthetic)
- As the user **rewrites** that text (types over it, replaces it), the AI mark is removed because the user is asserting ownership of the text

### How TipTap fits in — AI Gradient Text

TipTap's **Mark** system is exactly built for this. A `Mark` is a persistent, serialisable annotation that attaches to a range of inline text — like `Bold`, `Italic`, etc., but custom.

You will create a custom Mark called `AITextMark`:

```
AITextMark
├── name: "aiText"
├── spanning: true
├── inclusive: false       ← IMPORTANT: new text typed AFTER the mark
│                             will NOT inherit the mark automatically
├── renderHTML: () =>
│     ["span", { class: "ai-text-gradient" }, 0]
│                          ← wraps the text in a <span> with the CSS class
└── parseHTML: matches <span class="ai-text-gradient">
```

> **`inclusive: false`** is the magic setting. It means when the user places their cursor at the END of AI-marked text and starts typing, their new characters are NOT marked as AI text. This mirrors the iA Writer behaviour — as you retype, it becomes "yours."

> **`spanning: false` vs `true`**: Set `spanning: true` if you want the mark to continue across line breaks within the same paragraph (default TipTap behaviour). This is probably what you want.

### State Design — AI Gradient Text

```
BubbleMenu (appears on text selection)
│
├── "Edit by AI" button
│         │
│         ▼
│   Capture selection range: { from, to }
│   Capture selected text: editor.state.doc.textBetween(from, to)
│         │
│         ▼
│   Call AI API with selected text
│         │
│         ▼
│   On AI response:
│   editor.chain()
│     .focus()
│     .deleteRange({ from, to })          ← remove original text
│     .insertContentAt(from, {            ← insert AI text WITH mark
│         type: "text",
│         text: aiResponseText,
│         marks: [{ type: "aiText" }]
│     })
│     .run()
│         │
│         ▼
│   Editor JSON now contains the aiText mark
│   Auto-save persists it to the backend ✅
│         │
│         ▼
│   User starts typing over / inside AI text
│   → Because inclusive: false, new chars have NO mark
│   → User can manually "clear" AI mark via a button (optional)
```

### Implementation Flowchart — AI Gradient Text

```
User selects text in editor
        │
        ▼
BubbleMenu appears
  ├─ Shows existing formatting buttons (Bold, Italic, etc.)
  └─ Shows new "✨ Edit by AI" button
        │
        ▼
User clicks "Edit by AI"
        │
        ▼
Capture { from, to } = editor.state.selection
Capture selectedText = editor.state.doc.textBetween(from, to)
        │
        ▼
Show loading indicator (optional)
        │
        ▼
POST /api/ai/edit  { text: selectedText }
        │
        ├─── Error? → Show toast, abort, restore selection
        │
        └─── Success? AI returns { editedText: "..." }
                │
                ▼
        editor.chain()
          .deleteRange({ from, to })
          .insertContentAt(from, {
              type: "text",
              text: editedText,
              marks: [{ type: "aiText" }]
          })
          .run()
                │
                ▼
        Gradient text is now visible in the editor
                │
                ▼
        Auto-save fires (1s debounce) → persists to DB ✅
                │
                ▼
        User edits the text
          ├─ Types at END of AI text → new chars: no mark (inclusive: false)
          ├─ Types IN MIDDLE of AI text → inherits mark (expected behaviour)
          └─ Selects AI text → "Clear AI mark" button in BubbleMenu
                │
                ▼
        editor.chain().unsetMark("aiText").run()
        → Text becomes plain black, "claimed" by user
```

### The Custom Mark

```typescript
// src/components/editor/extensions/AITextMark.ts

import { Mark } from "@tiptap/core";

export const AITextMark = Mark.create({
  name: "aiText",

  // Mark does NOT expand to new characters typed after it
  inclusive: false,

  // The mark CAN span multiple inline nodes (default)
  spanning: true,

  // How it renders in the DOM
  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, class: "ai-text-gradient" }, 0];
  },

  // How to parse it back from HTML (important for paste and load)
  parseHTML() {
    return [
      {
        tag: "span.ai-text-gradient",
      },
    ];
  },
});
```

```css
/* index.css or editor.css */
.ai-text-gradient {
  background: linear-gradient(90deg, #00c6ff, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  transition: opacity 200ms ease;
}
```

> **Note on persistence:** Because the mark serialises into TipTap JSON (same as Bold/Italic does), your existing `getJSON()` → `setContent()` auto-save pipeline will automatically persist and reload AI-marked text. Zero extra backend work needed.

---

## Interaction Between the Two Features

These two features are **independent** and **additive** — they don't conflict.

| Scenario | Focus Mode | AI Gradient |
|----------|-----------|-------------|
| User in focus mode, active paragraph has AI text | Active paragraph: full opacity + gradient renders | ✅ No conflict |
| User in focus mode, inactive paragraph has AI text | Blurred + faded — gradient still applies but visually suppressed | ✅ Intended UX |
| Focus mode is off | All paragraphs visible | Gradient renders normally |
| User clears AI mark | Text turns plain | Focus mode unaffected |

---

## Files You Will Touch

```
frontend/src/
│
├── components/editor/
│   ├── EditorMain.tsx          ← Add focus-mode-active class to wrapper div
│   ├── MenuBar.tsx             ← Add "Focus Mode" toggle button
│   ├── extensions/
│   │   ├── AITextMark.ts       ← [NEW] Custom TipTap Mark
│   │   └── FocusModePlugin.ts  ← [NEW] ProseMirror Decoration plugin
│   └── BubbleMenuContent.tsx   ← [NEW] Replace inline <BubbleMenu> with
│                                   proper component containing "Edit by AI"
│
├── pages/
│   └── EditorPage.tsx          ← Add focusMode state, wire FocusModePlugin,
│                                   pass focusMode flag to EditorMain
│
├── api/
│   └── aiApi.ts                ← [NEW] POST /api/ai/edit endpoint call
│
└── index.css                   ← Add .focus-mode-active styles
                                    Add .ai-text-gradient styles
```

---

## Open Questions Before Building

1. **AI API**: Do you already have an AI endpoint on the backend (Hono/Cloudflare Workers)? Or will you call OpenAI/Gemini directly from the frontend?

2. **Focus Mode trigger**: Should Focus Mode activate automatically when the user starts typing (like iA Writer), or only when they explicitly click a "Focus" button in the MenuBar?

3. **Mark removal UX**: When a user edits AI text — do you want:
   - (a) Manual: Show "Clear AI mark" button only in BubbleMenu
   - (b) Automatic: Remove the mark from any characters the user explicitly overwrites
   - (c) Both?

4. **Gradient palette**: Do you have a brand colour for the gradient? Or should it match the dark-mode iA Writer aesthetic from your screenshot (cyan → orange → pink)?

5. **Persistence of Focus Mode**: Should `focusMode` be persisted in `localStorage` between sessions, or reset to `false` on every page load?

---

> **Bottom line:** Both features are well-scoped, idiomatic TipTap work. Focus Mode is purely CSS + a ProseMirror decoration plugin (~80 lines of code). AI Gradient Text is a custom Mark (~30 lines) + wiring up the BubbleMenu + an AI API call. Neither requires changes to your backend schema.
