import { CreateBoardPopover } from "./create-board-popover";
import { motion } from "motion/react";

interface NewBoardButtonProps {
  workspaceId?: string;
}

export function NewBoardButton({ workspaceId }: NewBoardButtonProps) {
  return (
    <CreateBoardPopover workspaceId={workspaceId} sideOffset={10} align="start">
      <motion.button
        whileHover={{ y: -2, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex h-32 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted md:h-28 cursor-pointer"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Create new board
        </span>
        <span className="text-xs text-muted-foreground/75">Unlimited</span>
      </motion.button>
    </CreateBoardPopover>
  );
}
