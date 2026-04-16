"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function ContactSearchBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState("");

  // debounce typing
  const debounced = useDebounce(value, 500);

  // ✅ correct dependency usage
  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search contacts..."
      className="w-full border rounded px-3 py-2"
    />
  );
}