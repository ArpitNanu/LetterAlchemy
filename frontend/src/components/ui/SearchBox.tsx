import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchPublicPosts } from "@/api/postApi";

const SearchBox = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🎓 ARCHITECTURE: 'isOpen' controls the visibility of the search dropdown. 
  // It only turns true when there are results to show or the user is typing.
  const [isOpen, setIsOpen] = useState(false);
  
  const navigate = useNavigate();

  // 🎓 ARCHITECTURE: 'dropdownRef' is used to identify this specific component in the DOM.
  // We use it to check if a user clicked "inside" or "outside" the search area.
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce effect: Prevents the API from being called on every single keystroke.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await searchPublicPosts(query);
          if (res.success) {
            setResults(res.data);
            setIsOpen(true);
          }
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); 

    return () => clearTimeout(timer);
  }, [query]);

  // 🎓 LOGIC: 'handleClickOutside' listens for clicks anywhere in the document.
  // If the click is NOT within 'dropdownRef', we close the search results.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If we have a reference to the dropdown AND the click target is NOT inside it...
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false); // ...then close the dropdown!
      }
    };
    // We add the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // And clean it up when the component unmounts to prevent memory leaks
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (id: number) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/post/${id}`);
  };

  return (
    <div className="flex-1 max-w-xl relative" ref={dropdownRef}>
      <div className="flex items-center rounded-full bg-brand-surface border border-border-subtle px-4 py-2 focus-within:ring-2 focus-within:ring-brand-highlight/20 transition-all shadow-sm">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          className="outline-none px-3 flex-1 bg-transparent text-sm text-text-main placeholder:text-text-muted/60 w-full"
          type="text"
          placeholder="Search your digital sanctuary..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {/* 🎓 UI: Loader2 is a spinning icon that only appears when 'loading' is true. 
            It gives the user instant feedback that the "Alchemy" is working in the background. */}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-subtle rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-md bg-opacity-95 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              <p className="px-4 py-1 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle/50 mb-1">
                Matching Posts
              </p>
              {results.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handleSelectResult(post.id)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-surface transition-colors flex flex-col gap-0.5 group"
                >
                  <span className="text-sm font-medium text-text-main group-hover:text-brand-primary transition-colors">
                    {post.title}
                  </span>
                  <span className="text-[11px] text-text-muted">Click to read more</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted italic">No secrets found matching "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
