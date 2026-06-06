import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store/hooks";
import { copyColumn } from "../../boardDetailSlide";
import { useToast } from "@/context/ToastContext";

interface CopyColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnTitle: string;
}

export function CopyColumnDialog({
  isOpen,
  onClose,
  columnId,
  columnTitle,
}: CopyColumnDialogProps) {
  const { t } = useTranslation(["boards"]);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(t("copy_of", { title: columnTitle }));
    }
  }, [isOpen, columnTitle, t]);

  const handleCopy = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await dispatch(copyColumn({ columnId, newTitle: title })).unwrap();

      addToast(t("list_copied_success"), "success");
      onClose();
    } catch (error) {
      addToast(t("list_copied_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("copy_list")}</DialogTitle>
          <DialogDescription>
            {t("copy_list_desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              id="name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCopy} disabled={loading || !title.trim()}>
            {loading ? t("creating") : t("create_list")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
