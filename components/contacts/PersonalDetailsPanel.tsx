"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import { useLookups } from "@/lib/hooks/useLookups";
import type { ContactPersonalDetail } from "@/models/contacts";

type GroupedDetails = Record<
  number,
  {
    name: string;
    items: ContactPersonalDetail[];
  }
>;

export default function PersonalDetailsPanel({
  contactId,
}: {
  contactId: string;
}) {
  const [details, setDetails] = useState<ContactPersonalDetail[]>([]);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const { detailCategories } = useLookups();

  useEffect(() => {
    const load = async () => {
      const res = await contactsApi.listDetails(contactId);
      setDetails(res);
    };

    load();
  }, [contactId]);

  const grouped: GroupedDetails = details.reduce((acc, d) => {
    const category = detailCategories.find((c) => c.id === d.category);
    const categoryId = d.category;
    const categoryName = category?.name ?? `Category ${categoryId}`;

    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: categoryName,
        items: [],
      };
    }

    acc[categoryId].items.push(d);
    return acc;
  }, {} as GroupedDetails);

  if (details.length === 0) {
    return <p className="text-sm text-gray-500">No details yet.</p>;
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <h3 className="font-semibold">Personal Details</h3>

      {Object.entries(grouped).map(([id, group]) => {
        const categoryId = Number(id);

        return (
          <div key={id} className="border rounded p-3">
            <p className="font-medium mb-2">{group.name}</p>

            <div className="space-y-1">
              {group.items.map((d) => (
                <p key={d.id} className="text-sm text-gray-600">
                  {d.detail_value}
                </p>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="Add detail"
                value={inputs[categoryId] || ""}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    [categoryId]: e.target.value,
                  })
                }
              />

              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={async () => {
                  const value = inputs[categoryId];
                  if (!value) return;

                  await contactsApi.createDetail(contactId, {
                    category: categoryId,
                    detail_value: value,
                  });

                  setInputs({
                    ...inputs,
                    [categoryId]: "",
                  });

                  const res = await contactsApi.listDetails(contactId);
                  setDetails(res);
                }}
              >
                Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}