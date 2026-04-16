"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { contactsApi } from "@/lib/api/contactsApi";

export default function TrustScoreSlider({
  contactId,
  value,
}: {
  contactId: string;
  value: number;
}) {
  const [score, setScore] = useState(value || 50);
  const debounced = useDebounce(score, 500);

  useEffect(() => {
    contactsApi.update(contactId, { trustScore: debounced });
  }, [debounced, contactId]);

  return (
    <div>
      <label className="block mb-1">Trust Score: {score}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}