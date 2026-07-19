import assert from "node:assert/strict";
import test from "node:test";

const presentationModule = await import(
  new URL("./logFormOptionPresentation.ts", import.meta.url).href
);

const {
  getLogFormOptionPresentation,
  getSentimentConnectionPresentation,
  getSentimentEmotionPresentation,
  getSentimentShiftPresentation,
  normalizeLogFormOptionValue,
  SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION,
} = presentationModule;

function iconName(icon: unknown) {
  const candidate = icon as { displayName?: string; name?: string };
  return candidate.displayName ?? candidate.name;
}

test("maps every curated emotional state to a distinct icon, tone, and comparison band", () => {
  const expectations = [
    ["Angry", "Angry", "negative", "negative"],
    ["Anxious", "Annoyed", "warning", "negative"],
    ["Ashamed", "Frown", "lavender", "negative"],
    ["Calm", "Flower2", "info", "positive"],
    ["Confused", "Orbit", "lavender", "negative"],
    ["Disconnected", "Unlink2", "neutral", "negative"],
    ["Hopeful", "Sprout", "positive", "positive"],
    ["Hurt", "HeartCrack", "warning", "negative"],
    ["Negative", "CloudRain", "neutral", "negative"],
    ["Neutral", "Meh", "neutral", "neutral"],
    ["Positive", "Smile", "positive", "positive"],
    ["Unsteady", "WavesHorizontal", "warning", "negative"],
    ["Very negative", "CircleAlert", "negative", "negative"],
  ] as const;

  const presentations = expectations.map(([label, icon, tone, band]) => {
    const presentation = getSentimentEmotionPresentation(label);
    assert.equal(presentation.source, "curated");
    assert.equal(presentation.label, label);
    assert.equal(iconName(presentation.icon), icon);
    assert.equal(presentation.tone, tone);
    assert.equal(presentation.comparisonBand, band);
    return presentation;
  });

  assert.equal(
    new Set(presentations.map((presentation) => presentation.key)).size,
    expectations.length,
  );
  assert.equal(
    new Set(presentations.map((presentation) => iconName(presentation.icon)))
      .size,
    expectations.length,
  );
});

test("uses the safe neutral fallback for unknown and custom emotions", () => {
  const custom = getSentimentEmotionPresentation("My custom feeling");
  assert.equal(custom.source, "fallback");
  assert.equal(custom.label, "My custom feeling");
  assert.equal(custom.tone, "neutral");
  assert.equal(custom.comparisonBand, undefined);
  assert.equal(iconName(custom.icon), "CircleDotDashed");
});

test("maps connection values without changing their stored values", () => {
  const close = getSentimentConnectionPresentation("close");
  const distant = getSentimentConnectionPresentation("distant");

  assert.deepEqual(
    [close.label, close.tone, iconName(close.icon)],
    ["Close", "positive", "Heart"],
  );
  assert.deepEqual(
    [distant.label, distant.tone, iconName(distant.icon)],
    ["More distant", "negative", "HeartCrack"],
  );
});

test("maps the required Social Energy values to semantic picker presentations", () => {
  const expectations = [
    ["social-energy-before-state", "open", "info", "UserRoundCheck"],
    ["social-energy-battery-effect", "reduced", "negative", "BatteryLow"],
    ["social-energy-mood-shift", "improved", "positive", "SmilePlus"],
    ["social-energy-behavioral-effect", "quieter", "info", "UserRound"],
    ["social-energy-recovery-timing", "later_day", "lavender", "Clock3"],
    [
      "social-energy-interaction-context",
      "one_on_one",
      "lavender",
      "UserRound",
    ],
  ] as const;

  for (const [group, value, tone, icon] of expectations) {
    const presentation = getLogFormOptionPresentation(group, value);
    assert.equal(presentation.source, "curated");
    assert.equal(presentation.tone, tone);
    assert.equal(iconName(presentation.icon), icon);
  }

  assert.equal(
    iconName(SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION.icon),
    "UsersRound",
  );
});

test("classifies positive, negative, neutral, and incomplete shifts for display only", () => {
  assert.deepEqual(
    projectShift(getSentimentShiftPresentation("Very negative", "Positive")),
    ["positive", "Positive shift", true],
  );
  assert.deepEqual(
    projectShift(getSentimentShiftPresentation("Positive", "Very negative")),
    ["negative", "Negative shift", true],
  );
  assert.deepEqual(
    projectShift(getSentimentShiftPresentation("Positive", "Hopeful")),
    ["neutral", "No clear shift", true],
  );
  assert.deepEqual(
    projectShift(getSentimentShiftPresentation("Positive", undefined)),
    ["incomplete", "Before → After", false],
  );
  assert.deepEqual(
    projectShift(
      getSentimentShiftPresentation("Positive", "My custom feeling"),
    ),
    ["incomplete", "Before → After", false],
  );
});

test("normalizes aliases without classifying unknown values as curated", () => {
  assert.equal(
    normalizeLogFormOptionValue("  VERY_negative "),
    "very negative",
  );
  assert.equal(
    getSentimentEmotionPresentation("VERY_negative").source,
    "curated",
  );
  assert.equal(
    getLogFormOptionPresentation("social-energy-before-state", "Not seeded")
      .source,
    "fallback",
  );
});

function projectShift(shift: {
  kind: string;
  label: string;
  makesClaim: boolean;
}) {
  return [shift.kind, shift.label, shift.makesClaim];
}
