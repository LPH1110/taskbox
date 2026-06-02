import { useEffect, useState } from "react";
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
import { copyColumn } from "../boardDetailSlide";
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
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(`Copy of ${columnTitle}`);
    }
  }, [isOpen, columnTitle]);

  const handleCopy = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await dispatch(copyColumn({ columnId, newTitle: title })).unwrap();

      addToast("List copied successfully", "success");
      onClose();
    } catch (error) {
      addToast("Failed to copy list", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Copy List</DialogTitle>
          <DialogDescription>
            Give your new list a title. It will include all cards from the
            original list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
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
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={loading || !title.trim()}>
            {loading ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
