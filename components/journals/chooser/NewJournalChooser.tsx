"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";

import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getJournalFamilyPresentation,
  getJournalLogFormatPresentation,
  getReflectionLensPresentation,
  type JournalIdentityPresentation,
} from "@/lib/presentation/journalPresentation";
import { cn } from "@/lib/utils";

export type NewJournalChooserOptionId =
  | "episode"
  | "social-energy"
  | "sentiment"
  | "interaction"
  | "moment"
  | "emotional"
  | "free";

export type NewJournalChooserOption = {
  id: NewJournalChooserOptionId;
  family: "log" | "reflection";
  label: string;
  description: string;
  href: string;
  presentation: JournalIdentityPresentation;
};

export const NEW_JOURNAL_OPTIONS: readonly NewJournalChooserOption[] = [
  {
    id: "episode",
    family: "log",
    label: "Episode",
    description: "Record a recurring state and its characteristics.",
    href: "/journals/logs/episode/new",
    presentation: getJournalLogFormatPresentation("episode"),
  },
  {
    id: "social-energy",
    family: "log",
    label: "Social energy",
    description: "Notice how socializing affected your capacity.",
    href: "/journals/logs/social-energy/new",
    presentation: getJournalLogFormatPresentation("socialEnergy"),
  },
  {
    id: "sentiment",
    family: "log",
    label: "Sentiment",
    description: "Track how an interaction changed how you felt.",
    href: "/journals/logs/sentiment/new",
    presentation: getJournalLogFormatPresentation("sentiment"),
  },
  {
    id: "interaction",
    family: "reflection",
    label: "Interaction",
    description: "Examine a specific exchange with a contact.",
    href: "/journals/reflections/interaction/new",
    presentation: getReflectionLensPresentation("interaction"),
  },
  {
    id: "moment",
    family: "reflection",
    label: "Moment",
    description: "Stay with one meaningful part of an experience.",
    href: "/journals/reflections/moment/new",
    presentation: getReflectionLensPresentation("moment"),
  },
  {
    id: "emotional",
    family: "reflection",
    label: "Emotional",
    description: "Understand an emotion or state of mind.",
    href: "/journals/reflections/emotional/new",
    presentation: getReflectionLensPresentation("emotional"),
  },
  {
    id: "free",
    family: "reflection",
    label: "Free reflection",
    description: "Write freely with optional context.",
    href: "/journals/reflections/free/new",
    presentation: getReflectionLensPresentation("free"),
  },
] as const;

type NewJournalChooserProps = {
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  getOptionHref?: (option: NewJournalChooserOption) => string;
  onOptionSelect?: (option: NewJournalChooserOption) => void;
};

type ChooserMode = "dialog" | "sheet";

export function NewJournalChooser({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  getOptionHref = (option) => option.href,
  onOptionSelect,
}: NewJournalChooserProps) {
  const isMobile = useIsMobile();
  const rootProps = { open, defaultOpen, onOpenChange };

  if (isMobile) {
    return (
      <Sheet {...rootProps}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className="max-h-[calc(100dvh-1rem)] gap-0 overflow-hidden rounded-t-xl p-0"
        >
          <ChooserContent
            mode="sheet"
            getOptionHref={getOptionHref}
            onOptionSelect={onOptionSelect}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog {...rootProps}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[min(42rem,calc(100dvh-2rem))] max-w-3xl gap-0 overflow-hidden p-0">
        <ChooserContent
          mode="dialog"
          getOptionHref={getOptionHref}
          onOptionSelect={onOptionSelect}
        />
      </DialogContent>
    </Dialog>
  );
}

function ChooserContent({
  mode,
  getOptionHref,
  onOptionSelect,
}: {
  mode: ChooserMode;
  getOptionHref: (option: NewJournalChooserOption) => string;
  onOptionSelect?: (option: NewJournalChooserOption) => void;
}) {
  const header = (
    <>
      {mode === "dialog" ? (
        <DialogHeader className="border-b border-border/70 px-5 py-4 pr-14 sm:px-6 sm:py-5 sm:pr-14">
          <DialogTitle className="text-2xl">Start a new journal</DialogTitle>
          <DialogDescription>What do you want to capture?</DialogDescription>
        </DialogHeader>
      ) : (
        <SheetHeader className="border-b border-border/70 px-5 py-4 pr-14 text-left">
          <SheetTitle className="text-2xl font-semibold">
            Start a new journal
          </SheetTitle>
          <SheetDescription>What do you want to capture?</SheetDescription>
        </SheetHeader>
      )}
    </>
  );

  const body = (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <ChooserFamilySection
        family="log"
        label="Log"
        description="Track something structured over time."
        options={NEW_JOURNAL_OPTIONS.filter(
          (option) => option.family === "log",
        )}
        mode={mode}
        getOptionHref={getOptionHref}
        onOptionSelect={onOptionSelect}
      />
      <ChooserFamilySection
        family="reflection"
        label="Reflection"
        description="Explore one experience and what it meant."
        options={NEW_JOURNAL_OPTIONS.filter(
          (option) => option.family === "reflection",
        )}
        mode={mode}
        getOptionHref={getOptionHref}
        onOptionSelect={onOptionSelect}
      />
    </div>
  );

  const footerContent = (
    <>
      <p className="flex min-w-0 items-start gap-2 text-xs leading-5 text-muted-foreground sm:mr-auto">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          Drafts start after your first meaningful entry and autosave as you
          write.
        </span>
      </p>
      {mode === "dialog" ? (
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
      ) : (
        <SheetClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </SheetClose>
      )}
    </>
  );

  return (
    <>
      {header}
      {mode === "dialog" ? (
        <DialogBody className="px-5 py-4 sm:px-6 sm:py-5">{body}</DialogBody>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{body}</div>
      )}
      {mode === "dialog" ? (
        <DialogFooter className="border-t border-border/70 px-5 py-4 sm:px-6">
          {footerContent}
        </DialogFooter>
      ) : (
        <SheetFooter className="border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center">
          {footerContent}
        </SheetFooter>
      )}
    </>
  );
}

function ChooserFamilySection({
  family,
  label,
  description,
  options,
  mode,
  getOptionHref,
  onOptionSelect,
}: {
  family: "log" | "reflection";
  label: string;
  description: string;
  options: readonly NewJournalChooserOption[];
  mode: ChooserMode;
  getOptionHref: (option: NewJournalChooserOption) => string;
  onOptionSelect?: (option: NewJournalChooserOption) => void;
}) {
  const familyPresentation = getJournalFamilyPresentation(family);

  return (
    <section
      aria-labelledby={`new-journal-${family}-heading`}
      className="min-w-0 rounded-lg border border-border/80 bg-card p-3"
    >
      <div className="flex min-w-0 items-start gap-3 px-1 py-1">
        <JournalIconTile presentation={familyPresentation} />
        <div className="min-w-0">
          <h3
            id={`new-journal-${family}-heading`}
            className="font-sans text-base font-semibold"
          >
            {label}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <ChooserOptionLink
            key={option.id}
            option={option}
            href={getOptionHref(option)}
            mode={mode}
            onSelect={onOptionSelect}
          />
        ))}
      </div>
    </section>
  );
}

function ChooserOptionLink({
  option,
  href,
  mode,
  onSelect,
}: {
  option: NewJournalChooserOption;
  href: string;
  mode: ChooserMode;
  onSelect?: (option: NewJournalChooserOption) => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={() => onSelect?.(option)}
      className={cn(
        "group flex min-h-20 min-w-0 items-center gap-3 rounded-md border border-border/80 bg-background px-3 py-2.5 outline-none transition-colors",
        "hover:border-primary/30 hover:bg-accent/35 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
    >
      <JournalIconTile presentation={option.presentation} size="compact" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {option.label}
        </span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
          {option.description}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );

  if (mode === "dialog") {
    return <DialogClose asChild>{link}</DialogClose>;
  }

  return <SheetClose asChild>{link}</SheetClose>;
}
