"use client";

export default function ClosenessBadge({ value }: { value?: string }) {
  return (
    <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-sm">
      {value ?? "Unknown"}
    </span>
  );
}