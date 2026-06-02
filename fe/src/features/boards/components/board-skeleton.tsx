import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full transition bg-muted/10">
      {/* 1. Board Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-background/30 backdrop-blur-md border-b shadow-sm relative z-10">
        {/* Title */}
        <Skeleton className="h-8 w-48 bg-primary/10" />

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-md" /> {/* Filter */}
          <Skeleton className="h-9 w-24 rounded-md" /> {/* Share */}
        </div>
      </div>

      {/* 2. Columns Canvas Skeleton */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 pt-6 pb-6 relative z-0 items-start">
        {/* Render 4 giả lập columns */}
        {[1, 2, 3, 4].map((colIndex) => (
          <div
            key={colIndex}
            className="w-72 shrink-0 flex flex-col gap-3 rounded-xl bg-background/50 border border-border/50 p-3 h-fit max-h-full shadow-sm"
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>

            {/* Dummy Tasks inside Column */}
            {[1, 2, 3].map((taskIndex) => (
              <div
                key={taskIndex}
                className="w-full rounded-xl bg-card p-3 shadow-sm border space-y-3"
              >
                {/* Task Tags/Meta */}
                <div className="flex gap-2">
                  <Skeleton className="h-2 w-8 rounded-full" />
                  <Skeleton className="h-2 w-12 rounded-full" />
                </div>
                {/* Task Title */}
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}

            {/* Add Card Button Placeholder */}
            <Skeleton className="h-9 w-full mt-1" />
          </div>
        ))}

        {/* Add List Button Placeholder */}
        <Skeleton className="w-72 shrink-0 h-12 rounded-xl bg-background/30 border border-border/30 shadow-sm" />
      </div>
    </div>
  );
}
