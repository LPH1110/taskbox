import { CreateBoardPopover } from "./create-board-popover";

export function NewBoardButton() {
  return (
    <CreateBoardPopover sideOffset={10} align="start">
      <button className="flex h-32 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted md:h-28">
        <span className="text-sm font-medium text-muted-foreground">
          Create new board
        </span>
        <span className="text-xs text-muted-foreground/75">Unlimited</span>
      </button>
    </CreateBoardPopover>
  );
}
