import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAttachments, uploadAttachment, deleteAttachment } from "../../boardDetailSlide";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { type Attachment } from "../../types/board-detail";
import { AttachmentItem } from "./attachment-item";

interface AttachmentSectionProps {
  taskId: string;
}

export function AttachmentSection({ taskId }: AttachmentSectionProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const attachments = useAppSelector((state) => state.boardDetail.attachments[taskId] || []);
  const { user } = useAppSelector((state) => state.auth);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchAttachments(taskId));
  }, [dispatch, taskId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(t("file_size_error"));
      return;
    }

    setIsUploading(true);
    try {
      await dispatch(uploadAttachment({ taskId, file })).unwrap();
    } catch (err: any) {
      alert(err.message || t("upload_failed"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (attachmentId: string) => {
    if (confirm(t("delete_attachment_confirm"))) {
      dispatch(deleteAttachment({ taskId, attachmentId }));
    }
  };

  if (attachments.length === 0 && !isUploading) {
    return (
      <input
        id="task-attachment-input"
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    );
  }

  return (
    <div className="flex gap-4 animate-in fade-in slide-in-from-top-2">
      <Paperclip className="mt-0.5 h-6 w-6 text-muted-foreground shrink-0" />
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{t("attachments_title")}</h3>
          <div>
            <label htmlFor="task-attachment-input" className="sr-only">
              {t("add_attachment")}
            </label>
            <input
              id="task-attachment-input"
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium bg-muted/30"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              {t("add_attachment")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((attachment: Attachment) => (
            <AttachmentItem 
              key={attachment.id}
              attachment={attachment}
              isOwner={user?.id === attachment.uploader_id}
              handleDelete={handleDelete}
            />
          ))}

          {isUploading && (
            <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/10 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">{t("uploading")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
