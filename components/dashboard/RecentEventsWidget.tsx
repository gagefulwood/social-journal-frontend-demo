import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventSummary } from "@/models/events";

export function RecentEventsWidget({ events }: { events: EventSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No recent events.
          </p>
        )}

        {events.slice(0, 5).map((event) => (
          <div key={event.id} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.event_timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {event.context_category && (
              <Badge variant="outline">{event.context_category.name}</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}