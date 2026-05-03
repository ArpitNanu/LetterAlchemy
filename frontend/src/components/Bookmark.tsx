import { useEffect, useState } from "react";
import PostCard from "@/components/ui/PostCard";
import { getBookmarkedPosts } from "@/api/postApi";
import { Bookmark as BookmarkIcon } from "lucide-react";

export const Bookmark = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching Phase
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        // Calling our newly created GET /bookmarks route
        const res = await getBookmarkedPosts();
        if (res.success) {
          setBookmarkedPosts(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  // 2. UI Presentation Layer
  return (
    <div className="h-full overflow-hidden flex flex-col p-6 max-w-4xl mx-auto w-full">
      {/* Header Section (Design Aesthetics) */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-brand-surface rounded-xl text-brand-primary">
          <BookmarkIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Your Reading List</h1>
          <p className="text-text-muted font-serif italic">
            Saved masterpieces, ready for you to revisit.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto pb-10">
        {loading ? (
          <div className="text-text-muted animate-pulse font-serif text-center mt-10">
            Retrieving your saved scrolls...
          </div>
        ) : bookmarkedPosts.length > 0 ? (
          /* Reusing the PostCard component for visual consistency */
          <PostCard posts={bookmarkedPosts} />
        ) : (
          /* Empty State Handling */
          <div className="text-center mt-20 border border-border-subtle rounded-2xl p-12 bg-surface shadow-sm">
            <BookmarkIcon className="w-12 h-12 text-border-subtle mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No bookmarks yet</h3>
            <p className="text-text-muted">
              When you find an interesting thought, click the bookmark icon to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};