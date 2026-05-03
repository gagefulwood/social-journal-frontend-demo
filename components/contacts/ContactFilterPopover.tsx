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
import type { Occupation, Relation } from "@/types/lookups";

type ContactFilterPopoverProps = {
  occupation: string;
  relation: string;
  occupations: Occupation[];
  relations: Relation[];
  isLoading: boolean;
  activeFilterCount: number;
  onOccupationChange: (value: string) => void;
  onRelationChange: (value: string) => void;
  onClearFilters: () => void;
};

export function ContactFilterPopover({
  occupation,
  relation,
  occupations,
  relations,
  isLoading,
  activeFilterCount,
  onOccupationChange,
  onRelationChange,
  onClearFilters,
}: ContactFilterPopoverProps) {
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
          <FilterRow label="Relation">
            <select
              value={relation}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              onChange={(event) => onRelationChange(event.target.value)}
            >
              <option value="">All relations</option>
              {relations.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterRow>

          <FilterRow label="Occupation">
            <select
              value={occupation}
              disabled={isLoading}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              onChange={(event) => onOccupationChange(event.target.value)}
            >
              <option value="">All occupations</option>
              {occupations.map((item) => (
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
