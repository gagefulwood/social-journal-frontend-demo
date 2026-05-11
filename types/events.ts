import type { ApiId, PaginatedResponse } from "@/types/api";
import type { ContactListItem } from "@/types/contacts";
import type { ContextCategory } from "@/types/lookups";

export type EventTier = "routine" | "milestone";

export type EventParticipant = {
  id: ApiId;
  contact: ContactListItem;
};

export type EventLogSummary = {
  id: ApiId;
  kind: "log";
  title: string;
  created_timestamp: string;
  updated_timestamp: string;
};

export type EventReflectionSummary = {
  id: ApiId;
  kind: "reflection";
  title: string;
  subtype: string;
  clarity_check: string;
  created_timestamp: string;
  updated_timestamp: string;
};

export type EventExerciseSummary = {
  id: ApiId;
  kind: "exercise";
  title: string;
  subtype: string;
  measurement_delta: number;
  created_timestamp: string;
  updated_timestamp: string;
};

export type EventJournalsSummary = {
  logs: EventLogSummary[];
  reflections: EventReflectionSummary[];
  exercises: EventExerciseSummary[];
};

export type EventListItem = {
  id: ApiId;
  title: string;
  event_timestamp: string;
  end_timestamp: string | null;
  location_label: string;
  tier: EventTier;
  context_category: ContextCategory | null;
  participant_count: number;
  journaled: boolean;
};

export type Event = {
  id: ApiId;
  user: ApiId;
  title: string;
  event_timestamp: string;
  end_timestamp: string | null;
  location_label: string;
  tier: EventTier;
  context_category: ApiId | null;
  participants: EventParticipant[];
  journaled: boolean;
  journals: EventJournalsSummary;
};

export type EventListResponse = PaginatedResponse<EventListItem>;

export type CreateEventRequest = {
  title: string;
  event_timestamp: string;
  end_timestamp?: string | null;
  location_label?: string;
  tier?: EventTier;
  context_category?: ApiId | null;
  participants?: ApiId[];
};

export type UpdateEventRequest = Partial<
  Omit<CreateEventRequest, "event_timestamp">
> & {
  event_timestamp?: never;
};
