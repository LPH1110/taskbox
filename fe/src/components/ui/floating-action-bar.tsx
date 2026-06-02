import { AnimatePresence, motion } from "motion/react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface FloatingActionBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export function FloatingActionBar({ isVisible, onSave, onDiscard, isSaving }: FloatingActionBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-xl"
        >
          <div className="flex items-center gap-3 px-2 text-sm font-medium">
            <span>Unsaved changes</span>
            <div className="h-4 w-px bg-border" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={isSaving} className="rounded-md">
              Discard
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="rounded-md">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
