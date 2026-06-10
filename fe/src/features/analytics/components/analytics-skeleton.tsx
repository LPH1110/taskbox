import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-100 dark:border-slate-800">
            <CardHeader className="h-16 pb-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-100 dark:border-slate-800">
          <CardHeader className="h-14 pb-2">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </CardHeader>
          <CardContent className="h-80 pb-4">
            <div className="w-full h-full bg-slate-150 dark:bg-slate-800/60 rounded" />
          </CardContent>
        </Card>
        <Card className="border-slate-100 dark:border-slate-800">
          <CardHeader className="h-14 pb-2">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </CardHeader>
          <CardContent className="h-80 pb-4">
            <div className="w-full h-full bg-slate-150 dark:bg-slate-800/60 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
