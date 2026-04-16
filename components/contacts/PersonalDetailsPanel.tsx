"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import EmptyState from "@/components/EmptyState";

type Detail = {
  id: number;
  label: string;
  value: string;
};

export default function PersonalDetailsPanel({
  contactId,
}: {
  contactId: string;
}) {
  const [details, setDetails] = useState<Record<string, Detail[]>>({});
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      const data = await contactsApi.getDetails(contactId);
      setDetails(data);
    };

    loadDetails();
  }, [contactId]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Personal Details</h3>

      {Object.keys(details).length === 0 ? (
        <EmptyState title="No details yet" />
      ) : (
        Object.entries(details).map(([category, items]) => (
          <div key={category} className="mb-3">
            <button
              onClick={() =>
                setOpen(open === category ? null : category)
              }
              className="font-medium w-full text-left"
            >
              {category}
            </button>

            {open === category && (
              <div className="mt-2 space-y-1">
                {items.map((d) => (
                  <div key={d.id} className="text-sm text-gray-600">
                    {d.label}: {d.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}