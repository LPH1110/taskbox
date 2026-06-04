import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreHorizontal, Send, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchComments, createComment, updateComment, deleteComment } from "../boardDetailSlide";
import { type Comment } from "../types/board-detail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector((state) => state.boardDetail.comments[taskId] || []);
  const { user } = useAppSelector((state) => state.auth);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    dispatch(fetchComments(taskId));
  }, [dispatch, taskId]);

  const topLevelComments = comments.filter((c: Comment) => !c.parent_id);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await dispatch(createComment({ taskId, content: newComment.trim() }));
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await dispatch(createComment({ taskId, content: replyContent.trim(), parentId }));
    setReplyContent("");
    setReplyingTo(null);
    setIsSubmitting(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    await dispatch(updateComment({ taskId, commentId, content: editContent.trim() }));
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      dispatch(deleteComment({ taskId, commentId }));
    }
  };

  const renderCommentItem = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.author_id;
    const authorName = comment.author?.full_name || comment.author?.email || "Unknown";
    const fallback = authorName.substring(0, 2).toUpperCase();
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;

    // Build children if top-level
    const children = isReply ? [] : comments.filter((c: Comment) => c.parent_id === comment.id);

    return (
      <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
        <Avatar className="h-8 w-8 shrink-0 border border-border">
          <AvatarImage src={comment.author?.avatar_url || ""} />
          <AvatarFallback className="text-xs bg-muted">{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-sm mr-2">{authorName}</span>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            </div>
            
            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-destructive focus:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none focus-visible:ring-1 focus-visible:ring-ring bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(comment.id)} disabled={isSubmitting}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border rounded-md p-3 text-sm whitespace-pre-wrap text-foreground/90">
              {comment.content}
            </div>
          )}

          {!isEditing && !isReply && (
            <button 
              onClick={() => { setReplyingTo(comment.id); setReplyContent(""); }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Reply
            </button>
          )}

          {isReplying && (
            <div className="pt-2 flex gap-3">
              <Avatar className="h-6 w-6 shrink-0 mt-1">
                <AvatarFallback className="text-[10px]">YOU</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 relative">
                <Textarea 
                  value={replyContent} 
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] resize-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleReply(comment.id)} disabled={isSubmitting || !replyContent.trim()}>Reply</Button>
                </div>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {children.length > 0 && (
            <div className="pt-2 space-y-4">
              {children.map((child: Comment) => (
                <div key={child.id}>{renderCommentItem(child, true)}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Box */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">YOU</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px] pb-10 resize-none bg-background focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button 
            size="sm" 
            className="absolute bottom-2 right-2 h-7 px-3 text-xs" 
            onClick={handlePost}
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send className="mr-2 h-3 w-3" /> Post
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-lg border border-dashed border-border/50">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No comments yet.</p>
            <p className="text-xs text-muted-foreground/70">Start the conversation!</p>
          </div>
        ) : (
          topLevelComments.map((comment: Comment) => (
            <div key={comment.id}>{renderCommentItem(comment)}</div>
          ))
        )}
      </div>
    </div>
  );
}
