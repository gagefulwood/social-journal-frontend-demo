export type MoodPolarityPresentation =
  | "positive"
  | "negative"
  | "neutral";

export function normalizeMoodPolarity(
  value: unknown,
): MoodPolarityPresentation | undefined {
  if (typeof value === "number") {
    if (value === 1) {
      return "positive";
    }

    if (value === -1) {
      return "negative";
    }

    if (value === 0) {
      return "neutral";
    }

    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "positive" ||
    normalized === "negative" ||
    normalized === "neutral"
  ) {
    return normalized;
  }

  return undefined;
}

export function moodPolarityToneClass(value: unknown): string {
  const polarity = normalizeMoodPolarity(value);

  if (polarity === "positive") {
    return "text-success";
  }

  if (polarity === "negative") {
    return "text-mood-sad";
  }

  return "text-mood-neutral";
}
