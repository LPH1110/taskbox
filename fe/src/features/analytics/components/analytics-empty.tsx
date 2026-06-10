import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AnalyticsEmptyProps {
  boardId: string;
}

export function AnalyticsEmpty({ boardId }: AnalyticsEmptyProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-card rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-md mx-auto mt-12">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-sky-50 dark:bg-sky-950/20 text-sky-500 mb-5">
        <BarChart3 className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No tasks created yet</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Create tasks and assign them to members on the board to populate your workload and status distributions.
      </p>
      <Button 
        onClick={() => navigate(`/boards/${boardId}`)}
        className="bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700"
      >
        Go to Board Detail
      </Button>
    </div>
  );
}
