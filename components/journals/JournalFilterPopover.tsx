"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { EntryTag, Mood } from "@/types/lookups";

type JournalFilterPopoverProps = {
    mood: string;
    entryTag: string;
    moods: Mood[];
    entryTags: EntryTag[];
    isLoading: boolean;
    activeFilterCount: number;
    onMoodChange: (value: string) => void;
    onTagChange: (value: string) => void;
    onClearFilters: () => void;
};

export function JournalFilterPopover({
    mood,
    entryTag,
    moods,
    entryTags,
    isLoading,
    activeFilterCount,
    onMoodChange,
    onTagChange,
    onClearFilters,
}: JournalFilterPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline">
                    <Filter className="size-4" />
                    {activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : "Filter"}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <PopoverHeader>
                    <PopoverTitle>Filters</PopoverTitle>
                </PopoverHeader>
                <div className="space-y-4">
                    <FilterRow label="Mood">
                        <select
                            value={mood}
                            disabled={isLoading}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            onChange={(event) => onMoodChange(event.target.value)}
                        >
                            <option value="">All moods</option>
                            {moods.map((item) => (
                                <option key={item.id} value={String(item.id)}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </FilterRow>

                    <FilterRow label="Tag">
                        <select
                            value={entryTag}
                            disabled={isLoading}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            onChange={(event) => onTagChange(event.target.value)}
                        >
                            <option value="">All tags</option>
                            {entryTags.map((item) => (
                                <option key={item.id} value={String(item.id)}>
                                    {item.tag_name}
                                </option>
                            ))}
                        </select>
                    </FilterRow>
                    {activeFilterCount > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onClearFilters}
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}