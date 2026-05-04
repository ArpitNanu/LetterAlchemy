import { Trash2 } from "lucide-react";

interface Author {
  firstName: string;
  lastName: string;
  avatar?: string;
  id?: number; // Added id to check for ownership
}

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  authorId: number; // Added authorId
  author: Author;
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: number;
  onDelete?: (id: number) => void;
}

export const CommentList = ({ comments, currentUserId, onDelete }: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted italic border-b border-border-subtle">
        No responses yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-12">
      {comments.map((comment) => (
        <div key={comment.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs overflow-hidden border border-border-subtle">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.firstName} className="w-full h-full object-cover" />
                ) : (
                  comment.author.firstName[0]
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main leading-none mb-1">
                  {comment.author.firstName} {comment.author.lastName}
                </p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {onDelete && currentUserId === comment.authorId && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <div className="pl-11">
            <p className="text-text-main leading-relaxed text-sm whitespace-pre-wrap">
              {comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
