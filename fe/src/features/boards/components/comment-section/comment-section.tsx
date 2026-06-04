import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { fetchComments, createComment, updateComment, deleteComment } from "../../boardDetailSlide";
import { type Comment } from "../../types/board-detail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector((state) => state.boardDetail.comments[taskId] || []);
  const { user } = useAppSelector((state) => state.auth);

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleReply = async (parentId: string, content: string) => {
    await dispatch(createComment({ taskId, content, parentId }));
  };

  const handleEdit = async (commentId: string, content: string) => {
    await dispatch(updateComment({ taskId, commentId, content }));
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      await dispatch(deleteComment({ taskId, commentId }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Box */}
      <CommentInput
        newComment={newComment}
        setNewComment={setNewComment}
        handlePost={handlePost}
        isSubmitting={isSubmitting}
      />

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
            <CommentItem
              key={comment.id}
              comment={comment}
              comments={comments}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  );
}
