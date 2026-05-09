# Building a Medium-Like Blog Read Page

This guide details how to build a beautiful, Medium-style reading experience for your blog application. 

## Architectural Decision: How to Render Content for Readers

When building a blog platform, **read speed and bundle size are everything**. If a user clicks a post and has to download heavy JavaScript libraries just to read text, they will leave. There are three ways to render TipTap JSON content on the frontend, and we must choose the best one for performance.

### Approach 1: The "Lazy" Way (Read-Only Editor)
This approach boots up the entire ProseMirror engine, sets up DOM observers, transaction managers, and keyboard event listeners, and then turns them all off by setting the editor to read-only mode.
* **Pros:** It's incredibly easy to write since you just reuse your existing editor setup.
* **Cons:** You are forcing the user's browser to download and execute heavy text-editing libraries just to look at static text. It ruins your initial load time (First Contentful Paint) and drains mobile batteries for no reason. 
* **Verdict:** Avoid this in production for reading pages.

### Approach 2: The "Smart" Way (Client-side HTML Generation)
This approach uses a lightweight generator package to take the JSON tree and run a pure JavaScript function to output an HTML string. No heavy editor engine is booted up.
* **Pros:** Huge performance boost. The bundle size is tiny because it doesn't load the editor engine. The browser renders raw HTML instantly. 
* **Cons:** Injecting raw HTML can be an XSS security risk if the content isn't trusted. However, because TipTap JSON is strictly structured, the generated output is usually safe HTML. You just have to trust your backend.
* **Verdict:** This is a solid, professional choice. It is the approach detailed in this guide.

### Approach 3: The "Senior Full-Stack" Way (Pre-compiled HTML)
Why should every single reader's browser spend CPU cycles converting JSON to HTML? If a post gets 100,000 views, we've forced 100,000 browsers to do the exact same math. The ultimate solution is to do this on the backend when the author hits "Publish". The backend saves both the JSON (for future editing) and the fully baked HTML string to the database. The frontend simply fetches the pre-compiled HTML string and injects it.
* **Pros:** Absolute maximum performance. Zero parsing on the client. If you ever move to a framework like Next.js for Server-Side Rendering (SSR), the page will render instantly. 
* **Cons:** It takes slightly more backend work to manage two fields.
* **Verdict:** This is the ultimate goal for scaling, but Approach 2 is the best starting point.

## Step 1: Update API Methods

First, you need an API function to fetch a specific post by its ID. Open `frontend/src/api/postApi.ts` and add this function:

```typescript
// frontend/src/api/postApi.ts
export const getPostById = async (id: string | number) => {
  const res = await apiClient.get(`/post/${id}`); // Update to match your backend route
  return res.data;
};
```

## Step 2: Ensure Routing is Setup

In your `frontend/src/App.tsx`, make sure the `PostPage` route uses a dynamic URL parameter `/:id` so we know which post to fetch:

```tsx
// frontend/src/App.tsx
import { PostPage } from "./pages/PostPage";

// Inside <Routes>
<Route path="/post/:id" element={<PostPage />} />
```

*(Note: `EditorPage.tsx` already redirects to `/post/${draftId}` after publishing, so this route matches perfectly!)*

## Step 3: Implement the Lightweight PostPage Component

To convert the JSON to HTML without instantiating the heavy editor, we can use the `@tiptap/html` package. 

First, install the lightweight HTML generator if you don't have it:
```bash
npm install @tiptap/html
```

Then, we generate the HTML string dynamically using `generateHTML` and inject it using `dangerouslySetInnerHTML`.

```tsx
// frontend/src/pages/PostPage.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "@/api/postApi";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

export const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Engagement States
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const res = await getPostById(id);
        if (res.success && res.data) {
          setPost(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Use useMemo to generate HTML only when the post content changes
  const htmlContent = useMemo(() => {
    if (!post?.content) return "";
    try {
      // Pass the JSON content and the extensions used to create it
      return generateHTML(post.content, [StarterKit]);
    } catch (e) {
      console.error("Error parsing content", e);
      return "";
    }
  }, [post?.content]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Post not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      <main className="max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author & Meta Info */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src="/docs/images/people/profile-picture-5.jpg" // Replace with actual author avatar
            alt="Author avatar"
          />
          <div>
            <p className="font-medium text-gray-900">Arpit Verma</p> {/* Replace with author name */}
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} · 5 min read
            </p>
          </div>
        </div>

        {/* Render HTML securely without loading the Editor Engine */}
        <article 
          className="prose prose-lg md:prose-xl prose-gray max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Bottom Engagement Bar (Sticky or Inline) */}
        <div className="border-t border-b border-gray-100 py-4 my-8 flex items-center justify-between text-gray-500 sticky bottom-4 bg-white/95 backdrop-blur-sm rounded-full px-6 shadow-sm">
          <div className="flex gap-6">
            <button 
              onClick={() => {
                setIsLiked(!isLiked);
                setLikes(prev => isLiked ? prev - 1 : prev + 1);
              }}
              className="flex items-center gap-2 hover:text-black transition-colors"
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likes}</span>
            </button>
            
            <button className="flex items-center gap-2 hover:text-black transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span>12</span>
            </button>
          </div>

          <div>
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:text-black transition-colors"
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? "fill-black text-black" : ""}`} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## Step 4: Add TipTap Styling for Read View

Since TipTap doesn't provide default styles, you need to ensure the rendered HTML looks good. If you are using `@tailwindcss/typography`, adding `prose` classes (as shown above) usually handles everything perfectly!

If you don't have `@tailwindcss/typography` installed, you should install it to get beautiful default styling for your blog posts automatically.

```bash
npm install -D @tailwindcss/typography
```

Then add it to your `tailwind.config.js`:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}
```

## Summary of the Approach
1. **Dynamic Routing:** App matches `/post/:id` and renders `PostPage`.
2. **Fetch by ID:** React retrieves the specific Post object (Title and JSON content).
3. **High Performance Rendering:** Instead of running the heavy TipTap editor engine, we use `@tiptap/html`'s `generateHTML` to convert the JSON statically into an HTML string. This completely eliminates the performance overhead!
4. **Beautiful UI:** Use Tailwind's `prose` classes to effortlessly add typography scale, spacing, and styling to the injected HTML, giving it a premium Medium-like reading experience.
5. **Engagement features:** Store local state (or hook up to your backend APIs later) for `likes` and `bookmarks` at the bottom of the page.
