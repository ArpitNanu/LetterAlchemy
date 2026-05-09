# Editor New Page Issue

## The Problem

After logging out and logging back in, clicking the "Write" button in the top navigation bar would **not** open a blank editor. Instead, it would automatically load the last draft the user was working on before logging out.

The user wanted to start with a **fresh, blank editor** every time they clicked "Write."

---

## Why It Was Happening — The Root Cause

### The "Resume" Pattern

The `EditorPage` component was designed with only one job: load the editor and immediately fetch the user's latest draft from the backend. It had no awareness of *why* the user navigated to that page.

Here is the flow that caused the issue:

1. User clicks "Write" → navigates to `/editor`.
2. `EditorPage` mounts → `useEffect` fires → calls `GET /posts/latest`.
3. Backend finds the user's last unfinished draft and returns it.
4. The editor loads that draft's title and content.

The application had no concept of **intent**. Whether the user meant "continue my old post" or "start a new one," the response was always the same: *load the last draft.*

### The Missing Concept: "New" vs. "Resume"

The fundamental gap was that the app treated the `/editor` route as both a "New Post" and a "Resume Post" page simultaneously. There was no fork in the road.

---

## The Two Approaches We Considered

### Approach A: ID in the URL ✅ (What we chose)
- Navigate to `/editor/new` for a fresh start; the editor skips fetching.
- Navigate to `/editor/:id` or `/editor` to resume an existing draft.
- On first keystroke, auto-save creates the draft in the DB and the URL silently updates from `/editor/new` → `/editor`.
- **Pro:** Instant load, no empty database rows, clean separation of intent.
- **Con:** Slightly more logic in the component.

### Approach B: Backend First
- Clicking "Write" immediately fires `POST /drafts` to create an empty draft, then navigates to `/editor/:id`.
- **Pro:** Simplest mental model — the editor always knows its draft ID on load.
- **Con:** Every "Write" click, even if the user leaves without typing, creates an empty row in the database ("graveyard of blank drafts").

---

## How We Solved It — Step by Step

### Mental Model First

Before writing any code, we established a clear mental model:

> "The URL should communicate the user's *intent* to the component. `/editor/new` means 'I want to write something brand new.' `/editor` means 'I may want to resume something.' The component reads the URL and acts accordingly."

This is the **"URL as the source of truth"** pattern, used by platforms like Medium and Notion.

---

### Step 1 — Add a New Route (`App.tsx`)

We registered a second route for the same `EditorPage` component. Both `/editor/new` and `/editor` point to the same component — the URL is just the signal.

```tsx
// Before
<Route path="/editor" element={<EditorPage />} />

// After
<Route path="/editor/new" element={<EditorPage />} />  {/* ← new route */}
<Route path="/editor" element={<EditorPage />} />
```

**Why:** React Router renders the same component for both paths. The component itself will inspect the URL to decide its behavior.

---

### Step 2 — Update the "Write" Button (`TopBar.tsx`)

The Write button in the top navigation bar was previously a plain `navigate("/editor")` call. We changed the destination to `/editor/new`.

```tsx
// Before
<button onClick={() => { navigate("/editor"); }} className="flex gap-1 cursor-pointer">
  <SquarePen />
  <span>Write</span>
</button>

// After
<button onClick={() => { navigate("/editor/new"); }} className="flex gap-1 cursor-pointer">
  <SquarePen />
  <span>Write</span>
</button>
```

**Why:** This is the "fork in the road." Clicking "Write" now carries an explicit intent — the user wants something *new*.

---

### Step 3 — Make `EditorPage` URL-Aware (`EditorPage.tsx`)

This is where the core logic lives. We made three targeted changes.

#### 3a. Import `useLocation`

`useLocation` is a React Router hook that gives you the current URL's `pathname`, `search`, and `hash`.

```tsx
// Before
import { useNavigate } from "react-router-dom";

// After
import { useNavigate, useLocation } from "react-router-dom";
```

#### 3b. Derive the `isNewDraft` flag

Inside the component body, we read the current pathname and derive a simple boolean.

```tsx
const navigate = useNavigate();
const location = useLocation();
const isNewDraft = location.pathname === "/editor/new"; // true or false
```

This single boolean is the decision-maker for everything that follows.

#### 3c. Conditional Fetching — Skip the API call for new drafts

In the `useEffect` that fetches the latest draft, we added an early return if `isNewDraft` is `true`.

```tsx
useEffect(() => {
  const fetchDraft = async () => {
    try {
      // NEW: If the user clicked "Write", skip fetching entirely.
      if (isNewDraft) {
        setIsHydrating(false); // unblock the editor
        return;
      }

      // Original logic for resuming a draft
      const res = await getLatestDraft();
      if (!res.success || !res.data) return;
      setTitle(res.data.title || "");
      setContent(res.data.content || EMPTY_DOC);
      setDraftId(res.data.id || null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsHydrating(false);
    }
  };
  fetchDraft();
}, []);
```

**Why `setIsHydrating(false)`?** The `isHydrating` flag is a gate that blocks the auto-save effect from running until the initial data load is complete. If we return early without setting it to `false`, the auto-save will never fire and the user can never save their new draft. We must always release the gate.

#### 3d. The URL Transition — "Silently promote" from `/new` to `/editor`

Once the user starts typing, the auto-save fires and creates a new draft in the database. At this point, the draft has an ID. We update the URL using `navigate("/editor", { replace: true })` so that:

- If the user **refreshes** the page, they land on `/editor` — which resumes the draft they were just writing.
- The browser history doesn't accumulate a `/editor/new` entry (the `replace: true` flag replaces the current history entry instead of pushing a new one).

```tsx
if (!draftId && !creatingDraft) {
  setCreatingDraft(true);

  const res = await createDraft({ title, content: safeContent });
  setDraftId(res.data.id);

  setCreatingDraft(false);
  navigate("/editor", { replace: true }); // ← the magic trick
}
```

---

## Complete Final State of Changed Files

### `EditorPage.tsx` (Key sections)

```tsx
import { useNavigate, useLocation } from "react-router-dom"; // ← Added useLocation

export const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();                              // ← new
  const isNewDraft = location.pathname === "/editor/new";     // ← new

  // ...state...

  // FETCH EFFECT — now URL-aware
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        if (isNewDraft) {           // ← new guard
          setIsHydrating(false);
          return;
        }
        const res = await getLatestDraft();
        // ...set title, content, draftId...
      } catch (error) {
        console.error(error);
      } finally {
        setIsHydrating(false);
      }
    };
    fetchDraft();
  }, []);

  // AUTO-SAVE EFFECT — now promotes the URL after first save
  useEffect(() => {
    // ...guard clauses...
    const timeout = setTimeout(async () => {
      if (!draftId && !creatingDraft) {
        setCreatingDraft(true);
        const res = await createDraft({ title, content: safeContent });
        setDraftId(res.data.id);
        setCreatingDraft(false);
        navigate("/editor", { replace: true }); // ← new
      } else if (draftId) {
        await updateDraft(draftId, { title, content: safeContent });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, draftId]);
};
```

---

## The Full User Journey After the Fix

| Step | URL | What Happens |
|---|---|---|
| 1. Click "Write" | `/editor/new` | Editor loads instantly. Blank slate. No API call. |
| 2. Start typing | `/editor/new` | 1-second debounce starts. |
| 3. Debounce fires | `/editor/new` | `createDraft()` is called. Backend returns `id: 42`. |
| 4. URL updates silently | `/editor` | `navigate("/editor", { replace: true })` fires. |
| 5. User refreshes | `/editor` | `getLatestDraft()` is called. Draft #42 is resumed. |
| 6. User clicks Publish | `/post/42` | Latest content saved, then published. |

---

## Interview Questions & Answers

These are the most likely questions you will be asked around this feature and the concepts behind it.

---

### React Router & URL Management

**Q1: What is `useLocation` and when would you use it?**

> `useLocation` is a hook from `react-router-dom` that returns the current location object — containing `pathname`, `search`, and `hash`. I use it whenever a component needs to behave differently depending on where the user navigated from, without needing props or global state to carry that signal. In this editor, instead of adding an `isNew` prop or a Zustand flag, the URL itself is the source of truth.

---

**Q2: What is the difference between `navigate("/editor")` and `navigate("/editor", { replace: true })`?**

> Without `replace: true`, React Router *pushes* a new entry onto the browser's history stack. The user can press the browser Back button to go to the previous URL. With `replace: true`, it *replaces* the current entry in the history stack. So pressing Back takes the user to wherever they were *before* clicking "Write," not to an intermediate `/editor/new` URL. In our case, we use `replace: true` when promoting the URL from `/editor/new` to `/editor` because we don't want a ghost entry in the history.

---

**Q3: Why do two separate routes point to the same component? Is that a good pattern?**

> Yes, absolutely. React Router matches a URL to a component — the component's logic determines what it *does* with that match. This is the same pattern used for any "create vs. edit" form. `/editor/new` and `/editor/:id` both render `EditorPage`, but the component reads the URL to decide whether to start blank or fetch existing data. It avoids code duplication and keeps the component's responsibilities unified.

---

**Q4: What happens if someone directly types `/editor/new` in the URL bar after they already have a draft saved?**

> They will get a blank editor, which is the correct and *expected* behavior — the URL explicitly states their intent is to create something new. If they later start typing, a new draft is created. Their old draft is not deleted; it still exists in the database and can be retrieved from a "My Drafts" page or by navigating to `/editor`.

---

### State Management & Component Lifecycle

**Q5: You set `isHydrating` to `true` initially and to `false` in the `finally` block. Why?**

> `isHydrating` is a gate flag. The auto-save `useEffect` has a guard: `if (isHydrating) return`. This prevents auto-save from triggering while the initial data load is still in flight. If we let auto-save run before the fetch completes, it might see an empty title and content and try to save a blank draft — or worse, overwrite the real content we're about to receive. By setting `isHydrating(false)` in the `finally` block, we ensure the gate is always released, even if the fetch throws an error.

---

**Q6: Why do you use a `useRef` (`hasHydratedEditor`) instead of a `useState` for tracking whether the editor content has been injected?**

> `useRef` does not cause a re-render when its value changes. If we used `useState` here, setting `hasHydrated` to `true` would trigger a re-render, which could create an infinite loop with the `useEffect` that reads it. `useRef` is the right tool for values that need to persist across renders but do not need to *trigger* renders — think of it as a private, mutable sticky note for the component.

---

**Q7: Why use a debounced `setTimeout` for auto-save instead of saving on every keystroke?**

> Saving on every keystroke would hammer the backend with dozens of API requests per second while a user is actively typing. A debounce of 1000ms means we wait until the user pauses typing for 1 second before sending the request. The `useEffect` returns a cleanup function (`clearTimeout`) which cancels the pending timeout every time the dependencies change — so the timer always resets on each keystroke and only fires once after the user stops.

---

**Q8: What is the risk of not having a "My Drafts" page with this implementation?**

> Each time a user starts a new post and abandons it (closes the tab without publishing), a draft row accumulates in the database. Over time this becomes "draft graveyard" — hundreds of unfinished, unreachable posts. Without a Drafts UI, users also have no way to deliberately resume an older unfinished post if they started a new one in between. The fix is a `/drafts` page that lists all of a user's unpublished posts, lets them click one to resume, and lets them delete unwanted ones.

---

### Architecture & Alternatives

**Q9: You considered two approaches. Why did you choose "ID in the URL" over "Backend First"?**

> The "Backend First" approach (creating a draft in the DB *before* navigating to the editor) is simpler to reason about but has a cost: every click of the "Write" button creates a database row, even if the user never types anything. At scale, this creates database noise and wastes storage. The "ID in the URL" approach is lazier — it only creates a draft when the user actually starts writing — which is a better user-data contract. It's also closer to what we had already built with the auto-save logic.

---

**Q10: How would you extend this if the product team wants to add a "Resume Draft" button on the homepage?**

> Easy. We'd call `GET /posts/latest` on the homepage, get the `id` back, and then do `navigate("/editor")`. The `EditorPage` is already set up to call `getLatestDraft()` when the URL is `/editor` (not `/editor/new`), so it would resume seamlessly. If we wanted to resume a specific draft by ID, we'd update the route to `/editor/:id` and fetch by that specific ID instead of fetching the "latest."

---

*Last updated: April 2026 | LetterAlchemy — EditorPage Draft Lifecycle Fix*
