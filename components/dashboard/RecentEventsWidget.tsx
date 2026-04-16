import { RecentEvent } from "@/lib/hooks/useDashboard";
import EmptyState from "@/components/EmptyState";

export default function RecentEventsWidget({
  events,
}: {
  events: RecentEvent[];
}) {
  if (events.length === 0) {
    return <EmptyState title="No recent events" />;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Recent Events</h3>

      {events.slice(0, 5).map((e) => (
        <div key={e.id} className="flex justify-between text-sm mb-1">
          <span>
            {e.mood} {e.title}
          </span>
          <span className="bg-gray-200 px-2 rounded">{e.tag}</span>
        </div>
      ))}
    </div>
  );
}