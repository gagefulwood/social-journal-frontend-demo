"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ClipboardList, Edit, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import {
  getFactCategoryPresentation,
  type FactCategoryPresentation,
} from "@/components/contacts/fact-category-presentation";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type {
  CreateFactRequest,
  Fact,
  UpdateFactRequest,
} from "@/types/contacts";
import type { FactCategory } from "@/types/lookups";

type FactsPanelProps = {
  facts?: Fact[];
  contactFirstName?: string;
  onCreate: (data: CreateFactRequest) => Promise<void>;
  onUpdate: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onDelete: (factId: ApiId) => Promise<void>;
};

type FactEditorState =
  | { mode: "closed" }
  | { mode: "create"; defaultCategoryId?: string }
  | { mode: "edit"; factId: ApiId };

export function FactsPanel({
  facts = [],
  contactFirstName = "this contact",
  onCreate,
  onUpdate,
  onDelete,
}: FactsPanelProps) {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const [editor, setEditor] = useState<FactEditorState>({ mode: "closed" });
  const createComposerRef = useRef<HTMLDivElement | null>(null);
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const groupedFacts = groupFactsByCategory(safeFacts, categories);

  useEffect(() => {
    if (editor.mode !== "create") {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      createComposerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [editor]);

  function openCreateComposer(defaultCategoryId?: string) {
    setEditor({ mode: "create", defaultCategoryId });
  }

  return (
    <section
      id="contact-facts-section"
      className="rounded-lg border border-border/80 bg-card p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-marker-violet text-marker-violet-foreground shadow-sm">
            <ClipboardList className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Facts</h2>
            <p className="text-sm text-muted-foreground">
              Key details I want to remember about {contactFirstName}.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-primary/30 text-primary-strong hover:bg-accent hover:text-accent-foreground"
          onClick={() => openCreateComposer()}
        >
          <Plus className="size-4" />
          Add fact
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {safeFacts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center sm:col-span-2">
            <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-marker-violet text-marker-violet-foreground shadow-sm">
              <FileText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">No facts saved yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add preferences, family details, or context you want to remember
              next time.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 border-primary/30 text-primary-strong hover:bg-accent hover:text-accent-foreground"
              onClick={() => openCreateComposer()}
            >
              <Plus className="size-4" />
              Add fact
            </Button>
          </div>
        )}
        {groupedFacts.map((group) => {
          const presentation = getFactCategoryPresentation(group.category);
          const Icon = presentation.icon;

          return (
            <div
              key={group.key}
              className={cn(
                "overflow-hidden rounded-lg border bg-background shadow-sm transition-shadow hover:shadow-md",
                presentation.border,
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-b p-4",
                  presentation.header,
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      presentation.badge,
                      presentation.text,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="truncate text-sm font-semibold">
                    {group.name}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    presentation.count,
                    presentation.text,
                  )}
                >
                  {group.facts.length}
                </span>
              </div>

              <div className="space-y-3 p-4">
                {group.facts.map((fact) => {
                  const isEditing =
                    editor.mode === "edit" && idsMatch(editor.factId, fact.id);

                  return (
                    <div key={fact.id} className="space-y-2">
                      <div className="group/fact flex gap-2">
                        <span
                          className={cn(
                            "mt-2 size-1.5 shrink-0 rounded-full",
                            presentation.dot,
                          )}
                        />
                        <p className="min-w-0 flex-1 break-words text-sm leading-6 text-foreground">
                          {fact.detail_value}
                        </p>
                        <div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity group-hover/fact:opacity-100">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              setEditor({ mode: "edit", factId: fact.id })
                            }
                            aria-label="Edit fact"
                            className="text-muted-foreground hover:text-primary-strong"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => void onDelete(fact.id)}
                            aria-label="Delete fact"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      {isEditing && (
                        <FactEditorTray
                          categories={categories}
                          fact={fact}
                          mode="edit"
                          presentation={presentation}
                          onCancel={() => setEditor({ mode: "closed" })}
                          onSubmit={async (data) => {
                            await onUpdate(fact.id, data);
                            setEditor({ mode: "closed" });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div ref={createComposerRef} className="mt-5">
        {editor.mode === "create" ? (
          <FactCreateComposer
            categories={categories}
            defaultCategoryId={editor.defaultCategoryId}
            onCancel={() => setEditor({ mode: "closed" })}
            onSubmit={async (data) => {
              await onCreate(data);
              setEditor({ mode: "closed" });
            }}
          />
        ) : (
          <Button
            variant="outline"
            className="h-12 w-full border-dashed border-primary/30 text-primary-strong hover:bg-accent hover:text-accent-foreground"
            onClick={() => openCreateComposer()}
          >
            <Plus className="size-4" />
            {safeFacts.length > 0 ? "Add another fact" : "Add your first fact"}
          </Button>
        )}
      </div>
    </section>
  );
}

type FactEditorBaseProps = {
  categories: FactCategory[];
  onCancel: () => void;
  onSubmit: (data: CreateFactRequest) => Promise<void>;
};

type FactCreateComposerProps = FactEditorBaseProps & {
  defaultCategoryId?: string;
};

function FactCreateComposer({
  categories,
  defaultCategoryId = "",
  onCancel,
  onSubmit,
}: FactCreateComposerProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-marker-violet text-marker-violet-foreground">
          <ClipboardList className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Add a new fact
          </h3>
          <p className="text-sm text-muted-foreground">
            Save something stable you want to remember.
          </p>
        </div>
      </div>
      <FactEditorFields
        categories={categories}
        initialCategoryId={defaultCategoryId}
        initialDetail=""
        mode="create"
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

type FactEditorTrayProps = FactEditorBaseProps & {
  fact: Fact;
  mode: "edit";
  presentation: FactCategoryPresentation;
};

function FactEditorTray({
  categories,
  fact,
  onCancel,
  onSubmit,
  presentation,
}: FactEditorTrayProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-inner",
        presentation.border,
        presentation.header,
      )}
    >
      <FactEditorFields
        categories={categories}
        initialCategoryId={fact.category == null ? "" : String(fact.category)}
        initialDetail={fact.detail_value}
        mode="edit"
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

type FactEditorFieldsProps = FactEditorBaseProps & {
  initialCategoryId: string;
  initialDetail: string;
  mode: "create" | "edit";
};

function FactEditorFields({
  categories,
  initialCategoryId,
  initialDetail,
  mode,
  onCancel,
  onSubmit,
}: FactEditorFieldsProps) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [detail, setDetail] = useState(initialDetail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const detailRef = useRef<HTMLTextAreaElement | null>(null);
  const trimmedDetail = detail.trim();
  const isUnchanged =
    mode === "edit" &&
    categoryId === initialCategoryId &&
    trimmedDetail === initialDetail.trim();
  const isSaveDisabled =
    isSubmitting || trimmedDetail.length === 0 || isUnchanged;

  useEffect(() => {
    detailRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaveDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        category: categoryId || null,
        detail_value: trimmedDetail,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-[0.8fr_1.4fr]">
        <div className="space-y-1.5">
          <Label htmlFor={`fact-${mode}-category`}>Category</Label>
          <select
            id={`fact-${mode}-category`}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`fact-${mode}-detail`}>Detail</Label>
          <textarea
            ref={detailRef}
            id={`fact-${mode}-detail`}
            className="min-h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 shadow-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Something stable I want to remember..."
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-border bg-background"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaveDisabled}
          className="bg-primary-strong text-primary-foreground hover:bg-primary"
        >
          {mode === "edit" ? "Save changes" : "Save fact"}
        </Button>
      </div>
    </form>
  );
}

type FactGroup = {
  key: string;
  category: FactCategory | undefined;
  name: string;
  facts: Fact[];
};

function groupFactsByCategory(
  facts: Fact[],
  categories: FactCategory[],
): FactGroup[] {
  const groups = new Map<string, FactGroup>();

  for (const fact of facts) {
    const category = categories.find((item) =>
      idsMatch(item.id, fact.category),
    );
    const key = category ? `category-${String(category.id)}` : "uncategorized";
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.facts.push(fact);
    } else {
      groups.set(key, {
        key,
        category,
        name: category?.name ?? "Uncategorized",
        facts: [fact],
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}
