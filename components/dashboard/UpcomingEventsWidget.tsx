import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardEvent } from "@/models/dashboard";

export function UpcomingEventsWidget({ events }: { events: DashboardEvent[] }) {
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
              {new Date(event.scheduled_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}