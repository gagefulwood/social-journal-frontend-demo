import { ArrowRight, BookOpen, ClipboardList } from "lucide-react";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { FactCategoryIconTile } from "@/components/presentation/FactCategoryIconTile";
import { Button } from "@/components/ui/button";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mapContextFacts,
  type ContextFact,
} from "@/lib/context/context-mappers";
import { getFactCategoryPresentation } from "@/lib/presentation/factPresentation";
import type { Fact } from "@/types/contacts";

type FactsPreviewCardProps = {
  facts: Fact[];
  totalCount?: number;
  loading?: boolean;
  error?: string | null;
  onViewAll: () => void;
};

export function FactsPreviewCard({
  facts,
  loading = false,
  error = null,
  onViewAll,
}: FactsPreviewCardProps) {
  const previewFacts = selectPreviewFacts(mapContextFacts(facts));

  return (
    <ContactSectionCard asChild density="compact" className="xl:shrink-0">
      <section aria-labelledby="overview-facts-title">
        <ContactSectionHeader
          headingId="overview-facts-title"
          icon={BookOpen}
          iconTone="violet"
          title="What I know"
          action={
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-0 text-primary-strong"
              onClick={onViewAll}
            >
              View all facts
              <ArrowRight className="size-4" />
            </Button>
          }
        />

        {loading ? (
          <FactsPreviewSkeleton />
        ) : error ? (
          <HelperError title="Unable to load facts" message={error} />
        ) : previewFacts.length > 0 ? (
          <ul className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {previewFacts.map((fact) => {
              const presentation = getFactCategoryPresentation(fact.category);

              return (
                <li
                  key={fact.id}
                  className="flex min-w-0 items-center gap-3 rounded-md border border-border/70 bg-background/60 p-2.5"
                >
                  <FactCategoryIconTile presentation={presentation} />
                  <div className="min-w-0">
                    {fact.label ? (
                      <>
                        <p className="break-words text-sm font-semibold leading-5 [overflow-wrap:anywhere]">
                          {fact.label}
                        </p>
                        <p className="break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
                          {fact.value}
                        </p>
                      </>
                    ) : (
                      <p className="break-words text-sm font-semibold leading-5 [overflow-wrap:anywhere]">
                        {fact.value}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyActionBox
            className="mt-4 text-left"
            icon={
              <IconBadge tone="neutral" size="sm" className="shadow-none">
                <ClipboardList className="size-4" />
              </IconBadge>
            }
            title="No facts yet"
            copy="Saved facts will appear here once you add context for this contact."
            action={
              <Button type="button" variant="outline" onClick={onViewAll}>
                Open Context
              </Button>
            }
          />
        )}
      </section>
    </ContactSectionCard>
  );
}

function selectPreviewFacts(facts: ContextFact[]): ContextFact[] {
  const seen = new Set<string>();
  const preview: ContextFact[] = [];

  for (const fact of facts) {
    const value = fact.value.trim();
    const identity = `${fact.label?.trim() ?? ""}\u0000${value}`.toLowerCase();
    if (!value || seen.has(identity)) {
      continue;
    }
    seen.add(identity);
    preview.push(fact);
    if (preview.length === 3) {
      break;
    }
  }

  return preview;
}

function FactsPreviewSkeleton() {
  return (
    <div
      className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading facts"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-md border border-border/70 p-2.5"
        >
          <Skeleton className="size-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HelperError({ title, message }: { title: string; message: string }) {
  return (
    <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
    </div>
  );
}
