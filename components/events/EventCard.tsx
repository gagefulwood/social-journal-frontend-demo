import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Event = {
  id: number;
  title: string;
  scheduled_at: string;
  context_category?: number | null;
};

export function EventCard({ event }: { event: Event }) {
  const formattedDate = new Date(event.scheduled_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        {event.context_category !== null && (
          <Badge variant="outline">
            Category {event.context_category}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}