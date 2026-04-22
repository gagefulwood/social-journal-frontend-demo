import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { EventSummary } from "@/models/events";

export function UpcomingEventsWidget({ events }: { events: EventSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No upcoming events.
          </p>
        )}

        {events.slice(0, 5).map((event) => (
          <div key={event.id}>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(event.event_timestamp).toLocaleDateString()}
            </p>
            {event.context_category && (
              <span className="text-xs text-muted-foreground">
                {event.context_category.name}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}