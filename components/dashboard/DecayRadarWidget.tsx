"use client";

import { useRouter } from "next/navigation";
import { DecayContact } from "@/lib/hooks/useDashboard";
import EmptyState from "@/components/EmptyState";

export default function DecayRadarWidget({
  data,
}: {
  data: DecayContact[];
}) {
  const router = useRouter();

  if (data.length === 0) {
    return <EmptyState title="No inactive contacts" />;
  }

  const sorted = [...data].sort((a, b) => b.days - a.days);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Decay Radar</h3>

      {sorted.map((c) => (
        <div key={c.id} className="flex justify-between mb-2 text-sm">
          <span>
            {c.name} ({c.days} days)
          </span>

          <button
            onClick={() => router.push(`/contacts/${c.id}`)}
            className="text-blue-600"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}