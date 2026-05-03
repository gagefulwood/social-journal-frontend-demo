import type { ApiId } from "@/types/api";
import type { Contact, ContactListItem, RelationshipTrend } from "@/types/contacts";
import type { FactCategory } from "@/types/lookups";

export function contactName(contact: Contact | ContactListItem) {
  return [contact.first_name, "middle_name" in contact ? contact.middle_name : "", contact.last_name]
    .filter(Boolean)
    .join(" ");
}

export function contactInitials(contact: Contact | ContactListItem) {
  const first = contact.first_name?.[0] ?? "";
  const last = contact.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function scorePercent(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function trendLabel(trend: RelationshipTrend) {
  return String(trend).replace(/_/g, " ");
}

export function idsMatch(left: ApiId | null | undefined, right: ApiId | null | undefined) {
  if (left == null || right == null) {
    return false;
  }

  return String(left) === String(right);
}

export function flattenFactCategories(categories: FactCategory[]): FactCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenFactCategories(category.children),
  ]);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      )
    : new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function toDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return dateOnlyMatch?.[1] ?? "";
}
