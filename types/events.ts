import type { ApiId, PaginatedResponse } from "@/types/api";
import type { ContactListItem } from "@/types/contacts";
import type {
  ContextCategory,
  InteractionMode,
  Mood,
} from "@/types/lookups";

export type EventTier = "routine" | "milestone";
export type EventImpact = "negative" | "neutral" | "positive" | "";

export type EventParticipant = {
  id: ApiId;
  contact: ContactListItem;
};

export type EventLogSummary = {
  id: ApiId;
  kind: "log";
  title: string;
  mood: Mood | null;
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
  description: string;
  event_timestamp: string;
  end_timestamp: string | null;
  location_label: string;
  tier: EventTier;
  impact: EventImpact;
  context_category: ContextCategory | null;
  interaction_mode: InteractionMode | null;
  mood: Mood | null;
  participants: EventParticipant[];
  participant_count: number;
  journaled: boolean;
};

export type EventRelatedReason =
  | "shared_participant"
  | "same_context"
  | "same_interaction_mode"
  | "same_tier"
  | string;

export type EventRelatedItem = EventListItem & {
  relation_reasons: EventRelatedReason[];
};

export type Event = {
  id: ApiId;
  user: ApiId;
  title: string;
  description: string;
  event_timestamp: string;
  end_timestamp: string | null;
  location_label: string;
  tier: EventTier;
  impact: EventImpact;
  context_category: ApiId | null;
  interaction_mode: InteractionMode | null;
  mood: Mood | null;
  participants: EventParticipant[];
  journaled: boolean;
  journals: EventJournalsSummary;
};

export type EventListResponse = PaginatedResponse<EventListItem>;

export type EventTimelineSummary = {
  total_moments: number;
  upcoming: number;
  routine: number;
  milestone: number;
  this_month: number;
  with_mood: number;
  with_impact: number;
};

export type CreateEventRequest = {
  title: string;
  description?: string;
  event_timestamp: string;
  end_timestamp?: string | null;
  location_label?: string;
  tier?: EventTier;
  impact?: EventImpact;
  context_category?: ApiId | null;
  interaction_mode_id?: ApiId | null;
  mood_id?: ApiId | null;
  participants?: ApiId[];
};

export type UpdateEventRequest = Partial<
  Omit<CreateEventRequest, "event_timestamp">
> & {
  event_timestamp?: never;
};
