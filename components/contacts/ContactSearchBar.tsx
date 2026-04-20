"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState } from "react";

export function ContactSearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <Input
      placeholder="Search contacts..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-sm"
    />
  );
}