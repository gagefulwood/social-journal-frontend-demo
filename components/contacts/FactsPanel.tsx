"use client";

import { useState } from "react";
import { Edit, FileText, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FactForm } from "@/components/contacts/FactForm";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { ApiId } from "@/types/api";
import type { CreateFactRequest, Fact, UpdateFactRequest } from "@/types/contacts";

type FactsPanelProps = {
  facts?: Fact[];
  onCreate: (data: CreateFactRequest) => Promise<void>;
  onUpdate: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onDelete: (factId: ApiId) => Promise<void>;
};

export function FactsPanel({
  facts = [],
  onCreate,
  onUpdate,
  onDelete,
}: FactsPanelProps) {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const [isCreating, setIsCreating] = useState(false);
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Facts</h2>
          <p className="text-sm text-muted-foreground">
            Stable details about this contact.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isCreating && (
        <div className="mb-4 rounded-md bg-muted p-4">
          <FactForm
            onSubmit={async (data) => {
              await onCreate(data);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {safeFacts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center sm:col-span-2">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-background text-muted-foreground">
              <FileText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium">No facts saved yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add details like preferences, family, or important context as you
              learn them.
            </p>
          </div>
        )}
        {safeFacts.map((fact) => {
          const category = categories.find((item) =>
            idsMatch(item.id, fact.category)
          );

          return (
            <div
              key={fact.id}
              className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              {editingFact?.id === fact.id ? (
                <FactForm
                  fact={fact}
                  onSubmit={async (data) => {
                    await onUpdate(fact.id, data);
                    setEditingFact(null);
                  }}
                  onCancel={() => setEditingFact(null)}
                />
              ) : (
                <div className="flex h-full items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md bg-background text-sm text-muted-foreground">
                        {category?.icon_reference || (
                          <Sparkles className="size-4" />
                        )}
                      </span>
                      <span className="truncate text-xs font-medium uppercase text-muted-foreground">
                        {category?.name ?? "Uncategorized"}
                      </span>
                    </div>
                    <p className="break-words text-sm font-medium leading-6">
                      {fact.detail_value}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditingFact(fact)}
                      aria-label="Edit fact"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => void onDelete(fact.id)}
                      aria-label="Delete fact"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
