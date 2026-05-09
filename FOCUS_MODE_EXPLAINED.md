# 🧘‍♂️ Focus Mode (RSVP Reader) - Engineering Guide & Interview Prep

This document breaks down the "Focus Mode" feature. It is written to help you understand exactly how the components interconnect, the advanced React/JavaScript concepts used, and how to discuss this feature confidently in an engineering interview.

---

## 🏗️ 1. The Big Picture: Architecture

The Focus Mode feature is built on a clear separation of concerns, divided into three main layers:

1.  **The Host (`ReaderPage.tsx`)**: This is the integration point. It holds the TipTap editor, manages the `focusActive` state, extracts the raw text, and triggers the overlay.
2.  **The Brain (`useFocusEngine.ts`)**: This is a custom React Hook. It contains 100% of the logic. It calculates the WPM speed, runs the timer, handles keyboard shortcuts, and figures out which words to show. It returns clean data and functions to the UI.
3.  **The Visuals (`FocusMode.tsx` & `FocusModeCard.tsx`)**: These components are "dumb" (purely presentational). They take the data from the Brain and render it beautifully. `FocusMode` uses a React Portal to take over the whole screen, and `FocusModeCard` renders the specific glassmorphic UI.

---

## 🔍 2. Step-by-Step Breakdown (How it interconnects)

### Step 1: Triggering the Feature (`ReaderPage.tsx`)
In the reader page, we have the TipTap editor which contains the rich text (HTML, headings, bold text, etc.). 
For Focus Mode, we only want *words*. 
When the user clicks the "Focus Mode" button, we pass `editor.getText()` to the component. This strips out all HTML tags and gives us pure, plain text.

### Step 2: Processing the Data (`useFocusEngine.ts`)
Inside the hook, the first thing we do is split the giant string of text into an array of words:
```javascript
// \s+ splits by any whitespace (spaces, newlines, tabs)
// .filter(Boolean) removes empty strings caused by extra spaces
const words = text.split(/\s+/).filter(Boolean);
```
We store this array in a `useRef` instead of `useState`. 
*Why?* Because `useState` causes the component to re-render every time it changes. Since the article's words don't change while we read, storing it in a `useRef` is much better for performance.

### Step 3: The Sliding Window Algorithm
To show the word, we don't just show `words[index]`. We use a "Sliding Window" to show peripheral context.
The `getWindow` function takes the `index` and grabs the 3 words before it, the current word, and the 3 words after it.
```javascript
before: [ words[index - 3] || "", words[index - 2] || "", words[index - 1] || "" ]
```
The `|| ""` (logical OR) is crucial. If `index` is `0`, `index - 3` is undefined. The `|| ""` safely falls back to an empty string so the app doesn't crash at the beginning or end of the article.

### Step 4: The Ticker (Recursive `setTimeout`)
To move to the next word automatically, we use a timer based on WPM (Words Per Minute).
The formula is: `60,000 / WPM = milliseconds delay`. (e.g., 200 WPM = 300ms per word).

We use a recursive `setTimeout` instead of `setInterval`:
```javascript
useEffect(() => {
  if (!isPlaying) return;
  const id = setTimeout(() => {
    setIndex(prev => prev + 1); // move to next word
  }, delay);
  return () => clearTimeout(id);
}, [isPlaying, index, delay]);
```
Every time the `index` changes, the `useEffect` runs again, scheduling the *next* timeout. This is incredibly stable and allows us to change the `delay` (WPM) on the fly smoothly.

### Step 5: The Global Hotkeys
We attach a `keydown` listener to the `window` object so the user can use the `Spacebar` to play/pause and `Escape` to exit without clicking anywhere.
We must use `e.preventDefault()` for the Spacebar, otherwise pressing Space will scroll the webpage underneath the overlay.

### Step 6: The Full-Screen Takeover (`FocusMode.tsx`)
We use `createPortal(overlay, document.body)`.
Normally, a React component renders exactly where you put it in the JSX tree. If a parent container has `overflow: hidden` or `z-index`, your full-screen overlay might get trapped inside a small box or hidden behind a sidebar.
`createPortal` teleports the component directly to the `<body>` tag, guaranteeing it covers 100% of the screen, regardless of the app's layout.

---

## 🎤 3. Interview Preparation

### 🗣️ How to pitch this feature
*"I built an immersive RSVP (Rapid Serial Visual Presentation) Focus Mode. It parses rich text from a TipTap editor into a high-performance sliding window array. I engineered a custom timing hook using recursive setTimeouts to dynamically handle WPM speed changes without event loop stacking. To ensure a flawless, distraction-free UI, I utilized React Portals to break out of the DOM hierarchy, global window event listeners for hotkeys, and CSS variables for seamless light/dark mode transitions."*

### 🧠 Technical Q&A

**Q1: Why did you use `setTimeout` recursively instead of `setInterval` for the word ticker?**
> **A:** `setInterval` is dangerous for UI updates because it fires continuously regardless of what the main thread is doing. If a render takes longer than the interval, events stack up, causing "glitches" or skipping words. A recursive `setTimeout` waits for the current cycle to finish before scheduling the next one. Additionally, it makes it much easier to dynamically change the delay (WPM) mid-sentence without having to `clearInterval` and instantiate a new one.

**Q2: What is a React Portal and why was it necessary here?**
> **A:** A Portal lets you render a component into a different part of the DOM tree (like `document.body`) while keeping it logically inside the React component tree (so it still has access to state/props). I needed this because the `ReaderPage` has complex layout wrappers, scroll containers, and sidebars. If I tried to make a `fixed inset-0` div inside that hierarchy, it could get trapped by a parent's `overflow: hidden` or `z-index` stacking context. Portals guarantee a true top-level overlay.

**Q3: How does your Sliding Window algorithm work?**
> **A:** Instead of keeping track of the whole array in UI state, I only track the `currentIndex`. On every render, a pure function derives a subset of the array (3 words before, current, 3 words after) by looking up `words[index - N]`. I used the `|| ""` fallback to handle edge cases at the start and end of the article, ensuring O(1) time complexity for extracting the viewable data.

**Q4: You attached a `keydown` listener to `window`. What are the potential memory leak risks here?**
> **A:** In Single Page Applications (SPAs), if you attach an event listener to the global `window` and the component unmounts, the listener stays active. If the user opens and closes Focus Mode 10 times, you'd have 10 listeners firing at once, causing massive bugs and memory leaks. I prevented this by returning a cleanup function from the `useEffect` (`window.removeEventListener`) which React guarantees to run when the component unmounts.

**Q5: Why did you use `useRef` to store the array of words instead of `useState`?**
> **A:** When you call `useState`, React tracks that variable and triggers a re-render of the component tree every time it updates. The array of words for the article is static—it doesn't change once Focus Mode opens. By putting it in `useRef`, I have synchronous access to the data across renders, but I don't trigger unnecessary render cycles, which keeps the high-speed RSVP animation perfectly smooth.

**Q6: How did you implement Light and Dark mode for an immersive overlay?**
> **A:** I avoided hardcoded utility classes (like `bg-black`) and implemented semantic CSS variables (e.g., `--color-focus-overlay`). In the `index.css`, these variables change based on the `.dark` class. For light mode, I used a high-transparency white with a subtle drop-shadow to maintain definition, whereas dark mode uses a deep, opaque black. This ensures the component adapts to the global system theme automatically.
