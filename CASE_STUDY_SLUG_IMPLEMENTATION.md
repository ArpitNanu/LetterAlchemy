# Case Study: Implementing SEO-Friendly Slugs in LetterAlchemy

## 📝 Overview
In this sprint, we transitioned LetterAlchemy from numeric ID-based routing (`/post/14`) to human-readable, slug-based routing (`/post/my-first-slug`). This change significantly improves SEO and user experience while maintaining backward compatibility for legacy posts.

---

## 🛠 The Architecture

### 1. The "Clutter Removal" Algorithm
To create clean URLs, we built a transformation pipeline using Regular Expressions (RegEx) to strip away "clutter" (special characters, emojis, punctuation) while keeping the content readable.

**The Pipeline:**
1.  **`toLowerCase()`**: Ensures the URL is consistent. Browsers and search engines prefer lowercase for canonical URLs.
2.  **`replace(/[^a-z0-9]+/g, '-')`**: This is the "clutter remover." 
    - `[^a-z0-9]` matches anything that is NOT a lowercase letter or a number.
    - `+` ensures that multiple special characters (like `!!!` or `...`) are collapsed into a **single hyphen**.
    - *Example:* `"Hello!!! World"` becomes `"hello-world"` instead of `"hello---world"`.
3.  **`replace(/^-+|-+$/g, '')`**: The "trimmer." It removes hyphens from the very beginning or end of the string.
    - *Example:* `"-hello-world-"` becomes `"hello-world"`.

### 2. Handling Collisions: The Uniqueness Loop
Because the database has a `@unique` constraint on the `slug` column, trying to save two posts with the same title would normally cause a server crash. We solved this with an **Iterative Suffix Loop**.

**How it works:**
- **Step A:** Generate the "Base Slug" (e.g., `my-post`).
- **Step B:** Query the database using `select: { id: true }`. This is a performance optimization—we only check if *any* record exists, without fetching the full content.
- **Step C:** If the slug exists, we enter a `while(true)` loop. We append a counter (suffix) to the base slug: `my-post-1`, `my-post-2`, etc.
- **Step D:** The loop continues until the database returns `null` for the candidate slug. Only then do we return the finalized string.

This ensures that even if 100 users write a post titled "Daily Update," the system will gracefully handle it by assigning `daily-update-1` through `daily-update-99`.

### 2. The Publish-Time Strategy
We decided to generate slugs **only when a post is published**. 
- **Drafts** remain accessible by ID (since they are private).
- **Published Posts** get a permanent slug based on their final title. This prevents "URL drift" where a title change might accidentally break an existing shared link.

---

## ⚡️ Challenges & Engineering "Gotchas"

This wasn't a straight path. We faced two real-world issues that required deep debugging:

### Problem A: The Silent Cloudflare Worker Crash
**Symptom:** The backend was running, but the `slug` column remained `null` after publishing.
**Root Cause:** Type mismatch in the Prisma Client. Our utility was importing from `@prisma/client`, but LetterAlchemy runs on the edge using `@prisma/client/edge`. 
**The Fix:** We implemented a "Type-Safe Injection" pattern using `ReturnType<typeof getPrisma>`. By telling the utility to accept "whatever type `getPrisma` returns," we ensured the code worked perfectly across both local development and Cloudflare's edge environment.

### Problem B: The "Old Code" Trap (Local vs. Deployed)
**Symptom:** The backend was sending slugs in the JSON response, but the browser URL was still using numeric IDs.
**Root Cause:** A classic developer pitfall. We were testing on `letteralchemy.pages.dev` (the production site) while the new frontend code was only on our local machine.
**The Fix:** Verified the implementation on `localhost:5173`. This highlighted that the frontend logic (App Router and Editor Redirects) must be deployed separately from the backend Worker.

---

## 🚀 Final Verification
We proved the system works by tracing a post lifecycle:
1. User writes "Hello World" in the Editor.
2. User clicks **Publish**.
3. Backend generates `hello-world`.
4. Frontend receives the slug and immediately calls `navigate('/post/hello-world')`.
5. The `ReaderPage` fetches the post using the slug string instead of a numeric ID.

## 📈 SEO Impact
- **Keywords in URL:** Search engines can now index our posts based on their titles.
- **User Trust:** Users can see what an article is about before clicking.
- **Persistence:** URLs are now independent of internal database IDs.

---
**Author:** Arpit Verma
**Project:** LetterAlchemy
**Date:** May 5, 2026
