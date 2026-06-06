import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  Download,
  Trash2,
  FileIcon,
  FileText,
  FileArchive,
  FileCode,
  Video,
  Music,
  FileSpreadsheet,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Attachment } from "../../types/board-detail";
import { formatBytes } from "./utils";

interface AttachmentItemProps {
  attachment: Attachment;
  isOwner: boolean;
  handleDelete: (attachmentId: string) => void;
}

const MIME_ICON_MAP = [
  { match: (mime: string) => mime.includes("video"), Icon: Video },
  { match: (mime: string) => mime.includes("audio"), Icon: Music },
  { match: (mime: string) => mime.includes("pdf"), Icon: FileText },
  { match: (mime: string) => mime.includes("image/"), Icon: ImageIcon },
  { match: (mime: string) => mime.includes("zip") || mime.includes("compressed"), Icon: FileArchive },
  { match: (mime: string) => mime.includes("spreadsheet") || mime.includes("csv"), Icon: FileSpreadsheet },
  { match: (mime: string) => mime.includes("json") || mime.includes("javascript") || mime.includes("html"), Icon: FileCode },
];

const getFileIcon = (mimeType: string, className: string) => {
  const match = MIME_ICON_MAP.find((m) => m.match(mimeType));
  const Icon = match ? match.Icon : FileIcon;
  return <Icon className={className} />;
};

export function AttachmentItem({
  attachment,
  isOwner,
  handleDelete
}: AttachmentItemProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language === "vi" ? vi : enUS;

  return (
    <div
      className="group relative flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:bg-accent/50"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden border border-border/50">
        {getFileIcon(
          attachment.mime_type,
          "h-8 w-8 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors"
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate text-sm font-medium" title={attachment.file_name}>
          {attachment.file_name}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true, locale })}</span>
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
}
