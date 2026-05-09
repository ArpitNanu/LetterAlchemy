# LetterAlchemy — Slug & Pagination Roadmap

> **Status:** In Progress | **Author:** Development Roadmap | **Last Updated:** 2026-05-05

---

## 🧠 Core Concepts: What and Why

### What is a Slug?
A slug is a **URL-safe, human-readable identifier** derived from a post's title.

```
Title:  "Why Rust is Better Than JavaScript"
ID URL: /reader/42          ← ugly, meaningless, no SEO value
Slug URL: /reader/why-rust-is-better-than-javascript  ← clean, meaningful, SEO-friendly
```

The slug lives in your database (`slug String? @unique` — already in your schema!) and replaces the numeric `id` in public-facing URLs.

### What is Pagination?
Pagination is the strategy of **splitting a large dataset into smaller, fixed-size chunks** delivered on demand.

```
Without pagination: SELECT * FROM posts  → returns 10,000 rows at once → server dies
With pagination:    SELECT * FROM posts LIMIT 10 OFFSET 0  → returns 10 rows → fast
```

Two styles exist:
| Style | How | Used By |
|---|---|---|
| **Offset/Page** | `?page=2&limit=10` | Most blogs, admin panels |
| **Cursor-based** | `?cursor=<last_id>` | Twitter, Instagram feeds |

We will implement **offset/page** pagination first (simpler), then upgrade to cursor-based.

---

## 🗺️ Full Development Roadmap

### Phase 1 — Slug Implementation

#### 1.1 Understand the Slug Generation Algorithm

A proper `generateSlug(title)` function must:
1. Lowercase everything: `"Hello World"` → `"hello world"`
2. Replace spaces/special chars with `-`: `"hello world"` → `"hello-world"`
3. Strip anything not alphanumeric or hyphen: `"it's cool!"` → `"its-cool"`
4. Collapse multiple hyphens: `"hello--world"` → `"hello-world"`
5. Trim leading/trailing hyphens: `"-hello-"` → `"hello"`

> ⚠️ **Your old attempt** (`title.replace(" ", "_")`) had 2 bugs:
> - `.replace()` without regex only replaces the **first** space, not all spaces
> - Underscore `_` is not standard for URLs — hyphen `-` is the convention

#### 1.2 Handle Slug Collisions

Since `slug` has `@unique` in your schema, two posts with the same title will CRASH your DB insert. You must check for uniqueness **before** inserting:

```
"My Post"    → "my-post"        ✅ unique → use it
"My Post"    → "my-post"        ❌ exists → try "my-post-1"
"My Post"    → "my-post-1"      ❌ exists → try "my-post-2"
"My Post"    → "my-post-2"      ✅ unique → use it
```

This requires a **recursive/looping uniqueness check** against the DB before insert.

#### 1.3 Decide: When Does Slug Get Generated?

**Option A — At CREATE time (draft phase):**
- Slug is set immediately when the post is first created
- Even drafts have a slug
- Problem: Title may change before publish, slug becomes stale

**Option B — At PUBLISH time:**
- Slug is generated only when `published: true` is set
- Slug always reflects the final title
- ✅ **This is the better approach for LetterAlchemy**

We will implement slug generation in the `/publish/:id` route.

#### 1.4 Broken Down Sub-Problems for Slug

| # | Sub-Problem | File | Work |
|---|---|---|---|
| S1 | Write `generateSlug(title)` utility | `backend/src/utils/slug.ts` (new) | Pure function, no DB |
| S2 | Write `generateUniqueSlug(title, prisma)` | same file | Adds DB uniqueness loop |
| S3 | Call it in `/publish/:id` route | `routes/posts.ts` | Save slug during publish |
| S4 | Add `GET /public/slug/:slug` route | `routes/posts.ts` | Fetch post by slug |
| S5 | Update frontend routing | `App.tsx` | Change `/reader/:id` → `/reader/:slug` |
| S6 | Update `ReaderPage` | `pages/ReaderPage.tsx` | Use `slug` param, call slug API |
| S7 | Update `PostCard` links | `components/ui/PostCard.tsx` | Link to slug URL |
| S8 | Update Search navigation | `components/ui/SearchBox.tsx` | Navigate to slug |
| S9 | Backfill old posts | One-time migration script | Generate slugs for existing posts |

---

### Phase 2 — Pagination Implementation

#### 2.1 Understand Offset Pagination Math

```
Page 1: OFFSET = (1-1) * 10 = 0   → rows 1-10
Page 2: OFFSET = (2-1) * 10 = 10  → rows 11-20
Page 3: OFFSET = (3-1) * 10 = 20  → rows 21-30

Formula: OFFSET = (page - 1) * limit
```

The API response must also return **total count** so the frontend knows how many pages exist:
```
totalPages = Math.ceil(totalCount / limit)
```

#### 2.2 The N+1 Problem — Why We Use `$transaction`

A naive approach does two DB calls:
```
1. prisma.post.count(...)        ← query 1
2. prisma.post.findMany(...)     ← query 2
```

The professional approach wraps them in a **Prisma transaction** — both run in a single DB round-trip:
```
prisma.$transaction([count_query, findMany_query])
```

This cuts DB latency in half for every paginated request.

#### 2.3 Frontend Pagination UI — Breaking It Down

The UI has 3 parts you must build separately:

| Part | What It Is | Sub-Problems |
|---|---|---|
| **State** | `currentPage`, `totalPages`, `posts`, `loading` | useState + useEffect |
| **API Layer** | `getPublicPosts(page, limit)` | Update `postApi.ts` |
| **UI Component** | `<Pagination>` component | Prev/Next buttons + page numbers |

#### 2.4 Broken Down Sub-Problems for Pagination

| # | Sub-Problem | File | Work |
|---|---|---|---|
| P1 | Update `GET /public` to accept `?page&limit` | `routes/posts.ts` | Add skip/take + count |
| P2 | Return metadata in response | `routes/posts.ts` | `{ data, total, page, totalPages }` |
| P3 | Update `getPublicPosts` API fn | `frontend/src/api/postApi.ts` | Pass page/limit params |
| P4 | Build `<Pagination>` component | `components/ui/Pagination.tsx` (new) | Pure UI, accepts props |
| P5 | Add state to `HomePage` | `pages/HomePage.tsx` | currentPage state |
| P6 | Connect state → API → UI | `pages/HomePage.tsx` | Wire everything together |

---

## 🔑 Questions to Deepen Your Understanding

### Slug Questions
1. **Why must slug be generated server-side, never client-side?**
   > If client generates it, two users could submit the same slug simultaneously before either is saved — race condition. Server's uniqueness loop + DB `@unique` constraint is the safety net.

2. **Why is `slug` `@unique` in the DB but nullable (`String?`)?**
   > Old posts created before this feature have no slug (null). Null values are excluded from unique constraints in PostgreSQL — two nulls can coexist. But two equal non-null strings cannot.

3. **Should a slug ever change after a post is published?**
   > **No.** If a slug changes, every external link, bookmark, and Google index entry breaks. This is called a "broken backlink." If title changes post-publish, keep the old slug and optionally add a redirect.

4. **What HTTP status code should `/public/slug/:slug` return if slug not found?**
   > `404 Not Found` — the resource genuinely does not exist at that URL.

5. **What is the difference between `replace(" ", "-")` and `replace(/\s+/g, "-")`?**
   > `.replace(str, sub)` replaces only the **first match**. `.replace(/\s+/g, "-")` is a regex with the `g` (global) flag — replaces **every** whitespace sequence.

### Pagination Questions
1. **What happens if `page=0` or `page=-1` is passed to your API?**
   > Without validation, `OFFSET = (0-1)*10 = -10` — Prisma throws an error. You must validate: `page = Math.max(1, Number(page) || 1)`.

2. **Why is cursor-based pagination better than offset for live feeds?**
   > With offset, if a new post is added while a user is on page 2, all posts shift — the user sees a duplicate on page 3. Cursor-based uses the last-seen ID as the anchor point, so new insertions don't affect what you've already seen.

3. **What does `$transaction` guarantee that two separate queries don't?**
   > Consistency. With two separate queries, a post could be created between the `count()` and `findMany()` calls, making your total off by 1. A transaction takes a consistent snapshot of the DB state.

4. **What is the performance cost of `count()` on a large table?**
   > PostgreSQL must scan the table for an exact count — expensive on millions of rows. Solution: Cache the count in Redis or use an approximate count (`pg_class.reltuples`). For LetterAlchemy's scale, exact count is fine.

5. **On the frontend, should page state live in URL (`?page=2`) or React state?**
   > **URL is better.** If state is in React, refreshing the page resets to page 1 and the user loses their place. URL state (`?page=2`) survives refresh, is shareable, and browser back/forward work correctly.

---

## ⚡ Performance Improvements from Slug + Pagination

| Feature | Current Problem | After Implementation |
|---|---|---|
| **Slug in URL** | `/reader/42` — Google ignores numeric IDs | `/reader/why-rust-beats-js` — Google indexes keywords in URL |
| **Slug lookup** | `WHERE id = 42` — indexed PK lookup | `WHERE slug = '...'` — also indexed via `@unique` |
| **Pagination** | `findMany()` returns ALL posts | `findMany({ take: 10, skip: n })` — 10 rows max per call |
| **$transaction** | 2 round-trips for count + data | 1 round-trip — halves DB latency |
| **URL sharing** | Numeric ID URL is opaque | Slug URL is self-describing — higher click-through rate |
| **Caching** | Hard to cache dynamic ID routes | Slug routes are stable — can be cached at CDN level |

---

## 🚦 Implementation Order (Dependency Graph)

```
S1 (generateSlug utility)
  └── S2 (generateUniqueSlug with DB check)
        └── S3 (use in /publish route)
              └── S4 (add GET /public/slug/:slug route)
                    ├── S5 (update App.tsx routing)
                    ├── S6 (update ReaderPage to use slug)
                    ├── S7 (update PostCard links)
                    └── S8 (update SearchBox navigation)
                          └── S9 (backfill old posts — optional last step)

P1 (paginate GET /public)
  └── P2 (return metadata)
        └── P3 (update frontend API fn)
              └── P4 (build Pagination component)
                    └── P5+P6 (wire into HomePage)
```

> ⚠️ **Critical:** Complete the full Slug chain (S1→S8) before starting Pagination. Pagination touches `GET /public` which also needs slug in its response shape.

---

## 📁 Files That Will Be Created or Modified

### New Files
- `backend/src/utils/slug.ts` — slug generation utility
- `frontend/src/components/ui/Pagination.tsx` — pagination UI component

### Modified Files
- `backend/src/routes/posts.ts` — add slug to publish, add slug route, paginate /public
- `frontend/src/App.tsx` — change route param from `:id` to `:slug`
- `frontend/src/pages/ReaderPage.tsx` — use slug param + slug API
- `frontend/src/pages/HomePage.tsx` — add pagination state
- `frontend/src/api/postApi.ts` — update API functions
- `frontend/src/components/ui/PostCard.tsx` — link to slug URL
- `frontend/src/components/ui/SearchBox.tsx` — navigate to slug URL
