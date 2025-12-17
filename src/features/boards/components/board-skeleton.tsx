import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full gap-4">
      {/* 1. Board Header Skeleton */}
      <div className="flex items-center justify-between px-4 pt-4">
        {/* Title */}
        <Skeleton className="h-10 w-48 bg-primary/10" />

        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" /> {/* Filter */}
          <Skeleton className="h-9 w-24" /> {/* Share */}
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Avatar/Menu */}
        </div>
      </div>

      {/* 2. Columns Canvas Skeleton */}
      <div className="flex flex-1 gap-4 overflow-x-auto custom-scrollbar px-4 pb-4">
        {/* Render 4 giả lập columns */}
        {[1, 2, 3, 4].map((colIndex) => (
          <div
            key={colIndex}
            className="w-72 shrink-0 flex flex-col gap-3 rounded-xl bg-muted/30 border p-3 h-fit max-h-full"
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Dummy Tasks inside Column */}
            {[1, 2, 3].map((taskIndex) => (
              <div
                key={taskIndex}
                className="w-full rounded-lg bg-background p-3 shadow-sm border space-y-2"
              >
                {/* Task Title */}
                <Skeleton className="h-4 w-3/4" />
                {/* Task Tags/Meta */}
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-3 w-8 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
              </div>
            ))}

            {/* Add Card Button Placeholder */}
            <Skeleton className="h-8 w-full mt-1" />
          </div>
        ))}

        {/* Add List Button Placeholder */}
        <Skeleton className="w-72 shrink-0 h-12 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}
