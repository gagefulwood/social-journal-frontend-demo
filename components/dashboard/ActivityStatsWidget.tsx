import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityStats } from "@/models/dashboard";

export function ActivityStatsWidget({ stats }: { stats: ActivityStats }) {
  const trendColor =
    stats.trend_percent > 0
      ? "bg-green-100 text-green-800"
      : stats.trend_percent < 0
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Activity Stats</CardTitle>
        <Badge className={trendColor}>
          {stats.trend_percent > 0 ? "+" : ""}
          {stats.trend_percent}%
        </Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.total_this_month}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {stats.trend_percent > 0 ? "+" : ""}
            {stats.trend_percent}%
          </p>
          <p className="text-xs text-muted-foreground">vs Last Month</p>
        </div>
      </CardContent>
    </Card>
  );
}