import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";
import { type Comment } from "../../types/board-detail";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  comments: Comment[];
  user: { id: string } | null;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
}

export function CommentItem({
  comment,
  isReply = false,
  comments,
  user,
  onEdit,
  onDelete,
  onReply
}: CommentItemProps) {
  const { t, i18n } = useTranslation(["boards"]);
  const locale = i18n.language === "vi" ? vi : enUS;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: authUser } = useAppSelector((state) => state.auth);

  const isOwner = user?.id === comment.author_id;
  const authorName = comment.author?.full_name || comment.author?.email || t("unknown_user");
  const fallback = authorName.substring(0, 2).toUpperCase();

  const children = isReply ? [] : comments.filter((c: Comment) => c.parent_id === comment.id);

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    await onEdit(comment.id, editContent);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex gap-3 animate-in fade-in slide-in-from-bottom-2 group/comment">
      {/* Thread line connecting parent avatar to children */}
      {!isReply && children.length > 0 && (
        <div className="absolute left-4 top-10 bottom-2 w-px bg-border/50 group-hover/comment:bg-border transition-colors z-0" />
      )}
      
      <Avatar className="h-8 w-8 shrink-0 border border-border relative z-10 bg-background">
        <AvatarImage src={comment.author?.avatar_url || ""} />
        <AvatarFallback className="text-xs bg-muted">{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-semibold text-sm mr-2">{authorName}</span>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale })}</span>
          </div>

          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setIsEditing(true); setEditContent(comment.content); }}>
                  <Edit2 className="h-4 w-4 mr-2" /> {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive focus:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> {t("delete")}
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
              <Button size="sm" onClick={handleEditSubmit} disabled={isSubmitting}>{t("save")}</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>{t("cancel")}</Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 border rounded-md p-3 text-sm whitespace-pre-wrap text-foreground/90">
            {comment.content}
          </div>
        )}

        {!isEditing && !isReply && (
          <button
            onClick={() => { setIsReplying(true); setReplyContent(""); }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            {t("reply")}
          </button>
        )}

        {isReplying && (
          <div className="pt-2 flex gap-3 relative z-10">
            <Avatar className="h-6 w-6 shrink-0 mt-1">
              <AvatarImage
                src={authUser?.avatarUrl || ""}
                alt={authUser?.fullName || "User"}
              />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{authUser?.fullName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 relative">
              <Textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={t("write_reply_placeholder")}
                className="min-h-[60px] resize-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>{t("cancel")}</Button>
                <Button size="sm" onClick={handleReplySubmit} disabled={isSubmitting || !replyContent.trim()}>{t("reply")}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Render Replies */}
        {children.length > 0 && (
          <div className="pt-4 space-y-5 relative z-10">
            {children.map((child: Comment) => (
              <CommentItem
                key={child.id}
                comment={child}
                isReply={true}
                comments={comments}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
