import { UpcomingEvent } from "@/lib/hooks/useDashboard";
import EmptyState from "@/components/EmptyState";

export default function UpcomingEventsWidget({
  events,
}: {
  events: UpcomingEvent[];
}) {
  if (events.length === 0) {
    return <EmptyState title="No upcoming events" />;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Upcoming</h3>

      {events.slice(0, 5).map((e) => (
        <div key={e.id} className="mb-2 text-sm">
          <p>{e.title}</p>
          <p className="text-gray-500">{e.date}</p>

          <div className="flex gap-1 mt-1">
            {e.people.map((p: string) => (
              <span key={p} className="bg-gray-200 px-2 rounded">
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}