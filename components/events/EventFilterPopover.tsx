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

import type { ContextCategory } from "@/types/lookups";

type EventFilterPopoverProps = {
  contextCategory: string;
  categories: ContextCategory[];
  isLoading: boolean;
  activeFilterCount: number;
  onContextCategoryChange: (value: string) => void;
  onClearFilters: () => void;
};

export function EventFilterPopover({
  contextCategory,
  categories,
  isLoading,
  activeFilterCount,
  onContextCategoryChange,
  onClearFilters,
}: EventFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          <Filter className="size-4" />
          {activeFilterCount > 0
            ? `Filter · ${activeFilterCount}`
            : "Filter"}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Event Filters</PopoverTitle>
        </PopoverHeader>

        <div className="space-y-4">
          <FilterRow label="Category">
            <select
              value={contextCategory}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              onChange={(e) =>
                onContextCategoryChange(e.target.value)
              }
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
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
