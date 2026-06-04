import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Paperclip, FileIcon, Download, Trash2, Loader2, Plus, FileText, FileArchive, FileCode, Video, Music, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAttachments, uploadAttachment, deleteAttachment } from "../boardDetailSlide";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { type Attachment } from "../types/board-detail";

interface AttachmentSectionProps {
  taskId: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function AttachmentSection({ taskId }: AttachmentSectionProps) {
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
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      await dispatch(uploadAttachment({ taskId, file })).unwrap();
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (attachmentId: string) => {
    if (confirm("Delete this attachment?")) {
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
          <h3 className="font-semibold text-base">Attachments</h3>
          <div>
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
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((attachment: Attachment) => {
            const isImage = attachment.mime_type.startsWith("image/");
            const isOwner = user?.id === attachment.uploader_id;

            return (
              <div
                key={attachment.id}
                className="group relative flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:bg-accent/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden border border-border/50">
                  {isImage ? (
                    <img 
                      src={attachment.file_url} 
                      alt={attachment.file_name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (() => {
                      const mime = attachment.mime_type;
                      const iconClass = "h-8 w-8 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors";
                      if (mime.includes("video")) return <Video className={iconClass} />;
                      if (mime.includes("audio")) return <Music className={iconClass} />;
                      if (mime.includes("pdf")) return <FileText className={iconClass} />;
                      if (mime.includes("zip") || mime.includes("compressed")) return <FileArchive className={iconClass} />;
                      if (mime.includes("spreadsheet") || mime.includes("csv")) return <FileSpreadsheet className={iconClass} />;
                      if (mime.includes("json") || mime.includes("javascript") || mime.includes("html")) return <FileCode className={iconClass} />;
                      return <FileIcon className={iconClass} />;
                    })()
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-sm font-medium" title={attachment.file_name}>
                    {attachment.file_name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{formatBytes(attachment.file_size)}</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md p-0.5 border shadow-sm">
                  <a href={attachment.file_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(attachment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {isUploading && (
            <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/10 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
