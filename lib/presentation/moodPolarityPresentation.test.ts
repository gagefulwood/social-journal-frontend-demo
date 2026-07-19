import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RelatedMomentSignal } from "@/components/events/RelatedMomentSignal";
import type { EventRelatedItem } from "@/types/events";
import {
  moodPolarityToneClass,
  normalizeMoodPolarity,
} from "@/lib/presentation/moodPolarityPresentation";

test("normalizes supported string polarities", () => {
  assert.equal(normalizeMoodPolarity("positive"), "positive");
  assert.equal(normalizeMoodPolarity("negative"), "negative");
  assert.equal(normalizeMoodPolarity("neutral"), "neutral");
});

test("normalizes the integer choices returned by the Mood serializer", () => {
  assert.equal(normalizeMoodPolarity(1), "positive");
  assert.equal(normalizeMoodPolarity(-1), "negative");
  assert.equal(normalizeMoodPolarity(0), "neutral");
});

test("returns undefined for missing, malformed, and unknown polarities", () => {
  assert.equal(normalizeMoodPolarity(null), undefined);
  assert.equal(normalizeMoodPolarity(undefined), undefined);
  assert.equal(normalizeMoodPolarity({ id: 1, name: "Positive" }), undefined);
  assert.equal(normalizeMoodPolarity(2), undefined);
  assert.equal(normalizeMoodPolarity("mixed"), undefined);
});

test("uses muted presentation for unsupported related-moment polarity", () => {
  const relatedMoment = {
    mood: {
      id: 7,
      name: "Legacy mood",
      emoji_icon: "",
      polarity: { id: 1, name: "Positive" },
      is_system_default: false,
    },
  };

  assert.doesNotThrow(() =>
    moodPolarityToneClass(relatedMoment.mood.polarity),
  );
  assert.equal(
    moodPolarityToneClass(relatedMoment.mood.polarity),
    "text-mood-neutral",
  );
});

test("renders an Event Detail related moment with numeric polarity", () => {
  const relatedMoment: EventRelatedItem = {
    id: 7,
    title: "Coffee check-in",
    description: "",
    event_timestamp: "2026-07-17T12:00:00Z",
    end_timestamp: null,
    location_label: "Corner Coffee",
    tier: "routine",
    impact: "",
    context_category: null,
    interaction_mode: null,
    mood: {
      id: 3,
      name: "Happy",
      emoji_icon: "",
      polarity: 1,
      is_system_default: true,
    },
    participants: [],
    participant_count: 0,
    journaled: false,
    relation_reasons: ["same_tier"],
  };

  const markup = renderToStaticMarkup(
    createElement(RelatedMomentSignal, { event: relatedMoment }),
  );

  assert.match(markup, /Happy/);
  assert.match(markup, /text-success/);
});

test("maps supported related-moment polarity to existing tones", () => {
  assert.equal(moodPolarityToneClass(1), "text-success");
  assert.equal(moodPolarityToneClass(-1), "text-mood-sad");
  assert.equal(moodPolarityToneClass(0), "text-mood-neutral");
});
