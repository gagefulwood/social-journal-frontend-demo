"use client";

import {
  Brain,
  Heart,
  Lightbulb,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
  UsersRound,
} from "lucide-react";

import {
  JournalField,
  LookupTagSelector,
} from "@/components/journals/fields/JournalFields";
import { createManifestation } from "@/components/journals/reflections/reflectionDraft";
import { JournalFormSection } from "@/components/journals/shared/JournalFormSection";
import { JournalFormSectionHeader } from "@/components/journals/shared/JournalFormSectionHeader";
import { Button } from "@/components/ui/button";
import type {
  EmotionalManifestationKind,
  EmotionalReflectionDetail,
  FreeReflectionDetail,
  InteractionReflectionDetail,
  MomentReflectionDetail,
} from "@/types/journals";

const textareaClassName =
  "min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function InteractionReflectionFields({
  step,
  value,
  onChange,
}: {
  step: string;
  value: InteractionReflectionDetail;
  onChange: (value: InteractionReflectionDetail) => void;
}) {
  const update = (field: keyof InteractionReflectionDetail, text: string) =>
    onChange({ ...value, [field]: text });

  if (step === "exchange") {
    return (
      <JournalFormSection className="space-y-4">
        <JournalFormSectionHeader
          icon={UsersRound}
          title="The exchange"
          description="Capture the interaction as you remember it. Your words are the record."
        />
        <div className="grid gap-4 border-t border-border/70 pt-4">
          <PromptArea
            label="What were you talking about or doing?"
            value={value.topic_or_activity}
            onChange={(text) => update("topic_or_activity", text)}
          />
          <PromptArea
            label="What did you say or do?"
            value={value.user_actions}
            onChange={(text) => update("user_actions", text)}
          />
          <PromptArea
            label="What did they say or do?"
            value={value.contact_actions}
            onChange={(text) => update("contact_actions", text)}
          />
          <PromptArea
            label="How did they respond to you?"
            value={value.contact_response}
            onChange={(text) => update("contact_response", text)}
          />
          <PromptArea
            label="How did you respond to them?"
            value={value.user_response}
            onChange={(text) => update("user_response", text)}
          />
        </div>
      </JournalFormSection>
    );
  }

  return (
    <JournalFormSection className="space-y-4">
      <JournalFormSectionHeader
        icon={Lightbulb}
        title="What it meant"
        description="Reflect on your experience without guessing at the other person’s intent."
      />
      <div className="grid gap-4 border-t border-border/70 pt-4 md:grid-cols-2">
        <PromptArea
          label="How do you feel about the interaction now?"
          value={value.feelings_now}
          onChange={(text) => update("feelings_now", text)}
        />
        <PromptArea
          label="What feels important to understand or remember?"
          value={value.important_to_understand}
          onChange={(text) => update("important_to_understand", text)}
        />
        <PromptArea
          label="Anything else you want to write?"
          description="Optional"
          value={value.additional_writing}
          className="md:col-span-2"
          onChange={(text) => update("additional_writing", text)}
        />
      </div>
    </JournalFormSection>
  );
}

export function MomentReflectionFields({
  step,
  value,
  onChange,
}: {
  step: string;
  value: MomentReflectionDetail;
  onChange: (value: MomentReflectionDetail) => void;
}) {
  const update = (field: keyof MomentReflectionDetail, text: string) =>
    onChange({ ...value, [field]: text });

  if (step === "focus") {
    return (
      <JournalFormSection className="space-y-4">
        <JournalFormSectionHeader
          icon={Sparkles}
          title="Choose the moment"
          description="Stay with one specific part of the experience."
        />
        <PromptArea
          label="What specific moment do you want to focus on?"
          value={value.focus_moment}
          placeholder="For example: Alex remembered my usual order."
          onChange={(text) => update("focus_moment", text)}
        />
      </JournalFormSection>
    );
  }

  if (step === "notice") {
    return (
      <JournalFormSection className="space-y-4">
        <JournalFormSectionHeader
          icon={MessageCircle}
          title="Notice what happened"
          description="Describe what you experienced directly."
        />
        <div className="grid gap-4 border-t border-border/70 pt-4">
          <PromptArea
            label="What happened in that specific moment?"
            value={value.what_happened}
            onChange={(text) => update("what_happened", text)}
          />
          <PromptArea
            label="What did you notice around you?"
            value={value.noticed_around}
            onChange={(text) => update("noticed_around", text)}
          />
          <PromptArea
            label="How did you respond?"
            value={value.response}
            onChange={(text) => update("response", text)}
          />
        </div>
      </JournalFormSection>
    );
  }

  return (
    <JournalFormSection className="space-y-4">
      <JournalFormSectionHeader
        icon={Lightbulb}
        title="What it means now"
        description="Explore the meaning this moment has for you."
      />
      <div className="grid gap-4 border-t border-border/70 pt-4 md:grid-cols-2">
        <PromptArea
          label="What made this moment stand out?"
          value={value.stood_out}
          onChange={(text) => update("stood_out", text)}
        />
        <PromptArea
          label="What does it mean to you now?"
          value={value.meaning_now}
          onChange={(text) => update("meaning_now", text)}
        />
        <PromptArea
          label="What would you like to remember?"
          value={value.remember}
          onChange={(text) => update("remember", text)}
        />
        <PromptArea
          label="Anything else you want to write?"
          description="Optional"
          value={value.additional_writing}
          onChange={(text) => update("additional_writing", text)}
        />
      </div>
    </JournalFormSection>
  );
}

export function EmotionalReflectionFields({
  step,
  value,
  onChange,
}: {
  step: string;
  value: EmotionalReflectionDetail;
  onChange: (value: EmotionalReflectionDetail) => void;
}) {
  const update = (field: keyof EmotionalReflectionDetail, next: unknown) =>
    onChange({ ...value, [field]: next });

  if (step === "feelings") {
    return (
      <div className="grid gap-4">
        <JournalFormSection className="space-y-4">
          <JournalFormSectionHeader
            icon={Heart}
            iconTone="rose"
            title="Feelings and state of mind"
            description="Choose the words that fit. These are descriptors, not scores."
          />
          <LookupTagSelector
            kind="emotion-states"
            value={value.emotion_ids}
            label="Current selections"
            onChange={(next) =>
              update(
                "emotion_ids",
                Array.isArray(next) ? next : next == null ? [] : [next],
              )
            }
          />
          <PromptArea
            label="What was happening when these feelings appeared?"
            value={value.situation}
            onChange={(text) => update("situation", text)}
          />
        </JournalFormSection>

        <JournalFormSection className="space-y-4">
          <JournalFormSectionHeader
            icon={Brain}
            title="How did they show up?"
            description="Record thoughts, body responses, or behavior you personally noticed."
          />
          <div className="grid gap-3 md:grid-cols-3">
            {(
              ["thought", "body", "behavior"] as EmotionalManifestationKind[]
            ).map((kind) => (
              <ManifestationColumn
                key={kind}
                kind={kind}
                value={value}
                onChange={onChange}
              />
            ))}
          </div>
        </JournalFormSection>
      </div>
    );
  }

  return (
    <JournalFormSection className="space-y-4">
      <JournalFormSectionHeader
        icon={Lightbulb}
        title="Understand what you felt"
        description="Explore possibilities while keeping your reflection grounded in your experience."
      />
      <div className="grid gap-4 border-t border-border/70 pt-4 md:grid-cols-2">
        <PromptArea
          label="What seemed connected to these feelings?"
          value={value.connected_factors}
          onChange={(text) => update("connected_factors", text)}
        />
        <PromptArea
          label="What might the feelings have been communicating?"
          value={value.communicating}
          onChange={(text) => update("communicating", text)}
        />
        <PromptArea
          label="What do you understand now?"
          value={value.understanding_now}
          onChange={(text) => update("understanding_now", text)}
        />
        <PromptArea
          label="Anything else you want to write?"
          description="Optional"
          value={value.additional_writing}
          onChange={(text) => update("additional_writing", text)}
        />
      </div>
    </JournalFormSection>
  );
}

export function FreeReflectionFields({
  value,
  onChange,
}: {
  value: FreeReflectionDetail;
  onChange: (value: FreeReflectionDetail) => void;
}) {
  return (
    <JournalFormSection className="space-y-4 p-5 md:p-6">
      <JournalFormSectionHeader
        icon={Sparkles}
        title="Your reflection"
        description="Write in your own words. You can add context and media whenever it helps."
      />
      <textarea
        aria-label="Reflection"
        value={value.body}
        rows={14}
        className={`${textareaClassName} min-h-80 bg-card text-base leading-8`}
        placeholder="Start wherever feels useful…"
        onChange={(event) => onChange({ body: event.target.value })}
      />
    </JournalFormSection>
  );
}

function ManifestationColumn({
  kind,
  value,
  onChange,
}: {
  kind: EmotionalManifestationKind;
  value: EmotionalReflectionDetail;
  onChange: (value: EmotionalReflectionDetail) => void;
}) {
  const items = value.manifestations
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.kind === kind);
  const labels = {
    thought: "Thoughts",
    body: "Body",
    behavior: "Behavior",
  } as const;

  return (
    <div className="rounded-md border border-border/80 bg-muted/15 p-3">
      <h3 className="text-sm font-semibold capitalize">{labels[kind]}</h3>
      <div className="mt-2 grid gap-2">
        {items.map(({ item, index }) => (
          <div
            key={item.id ?? `${kind}-${index}`}
            className="flex items-start gap-1.5"
          >
            <textarea
              value={item.text}
              rows={2}
              aria-label={`${labels[kind]} response`}
              className="min-h-16 min-w-0 flex-1 resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) => {
                const manifestations = value.manifestations.map(
                  (current, currentIndex) =>
                    currentIndex === index
                      ? { ...current, text: event.target.value }
                      : current,
                );
                onChange({ ...value, manifestations });
              }}
            />
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={`Remove ${kind}`}
              onClick={() => {
                const manifestations = value.manifestations
                  .filter((_, currentIndex) => currentIndex !== index)
                  .map((current, displayOrder) => ({
                    ...current,
                    display_order: displayOrder,
                  }));
                onChange({ ...value, manifestations });
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onChange({
              ...value,
              manifestations: [
                ...value.manifestations,
                createManifestation(kind, value.manifestations.length),
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add {kind}
        </Button>
      </div>
    </div>
  );
}

function PromptArea({
  label,
  description,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <JournalField label={label} description={description}>
        <textarea
          value={value}
          rows={3}
          className={textareaClassName}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </JournalField>
    </div>
  );
}
