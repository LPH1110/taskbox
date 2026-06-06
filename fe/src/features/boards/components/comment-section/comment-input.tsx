import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/store/hooks";
import { Send } from "lucide-react";

interface CommentInputProps {
  newComment: string;
  setNewComment: (val: string) => void;
  handlePost: () => void;
  isSubmitting: boolean;
}

export function CommentInput({
  newComment,
  setNewComment,
  handlePost,
  isSubmitting
}: CommentInputProps) {
  const { t } = useTranslation(["boards"]);
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user?.avatarUrl || ""}
          alt={user?.fullName || "User"}
        />
        <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={t("write_comment_placeholder")}
          className="min-h-[80px] pb-10 resize-none bg-background focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          size="sm"
          className="absolute bottom-2 right-2 h-7 px-3 text-xs"
          onClick={handlePost}
          disabled={isSubmitting || !newComment.trim()}
        >
          <Send className="mr-2 h-3 w-3" /> {t("post_comment")}
        </Button>
      </div>
    </div>
  );
}
