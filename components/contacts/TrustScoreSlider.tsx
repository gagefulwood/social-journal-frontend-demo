"use client";

import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState, useRef } from "react";
import { contactsApi } from "@/lib/api/contactsApi";

export function TrustScoreSlider({
  contactId,
  value,
}: {
  contactId: number;
  value: number;
}) {
  const [localValue, setLocalValue] = useState(value);
  const debounced = useDebounce(localValue, 600);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    contactsApi.update(contactId, { trust_score: debounced });
  }, [debounced, contactId]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Trust Score</span>
        <span>{localValue} / 100</span>
      </div>

      <Slider
        min={0}
        max={100}
        step={1}
        value={[localValue]}
        onValueChange={([v]) => setLocalValue(v)}
      />
    </div>
  );
}