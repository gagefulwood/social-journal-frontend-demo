import type { ApiId, PaginatedResponse } from "@/types/api";
import type { ContactListItem } from "@/types/contacts";
import type {
  JournalContactSummary,
  JournalStatus,
  LogFormat,
  ReflectionLens,
} from "@/types/journals";
import type { ContextCategory, InteractionMode, Mood } from "@/types/lookups";
import type { MediaAssetListItem, NormalizedMediaCrop } from "@/types/media";

export type EventTier = "routine" | "milestone";
export type EventImpact = "negative" | "neutral" | "positive" | "";

export type EventParticipant = {
  id: ApiId;
  contact: ContactListItem;
};

export type EventLogSummary = {
  id: ApiId;
  family: "log";
  format: LogFormat | "legacy";
  status: JournalStatus;
  title: string;
  summary?: string;
  excerpt?: string;
  occurred_at: string | null;
  primary_contact: JournalContactSummary | null;
  created_timestamp: string;
  updated_timestamp: string;
};

export type EventReflectionSummary = {
  id: ApiId;
  family: "reflection";
  format: ReflectionLens | "legacy";
  status: JournalStatus;
  title: string;
  summary?: string;
  excerpt?: string;
  occurred_at: string | null;
  primary_contact: JournalContactSummary | null;
  created_timestamp: string;
  updated_timestamp: string;
};

export type EventJournalsSummary = {
  logs: EventLogSummary[];
  reflections: EventReflectionSummary[];
  log_count: number;
  reflection_count: number;
};

export type EventMediaAttachment = {
  id: ApiId;
  event_id?: ApiId;
  media_asset?: MediaAssetListItem;
  chapter_id?: ApiId | null;
  display_order: number;
  recorded_at?: string | null;
  alt_text?: string;
  caption?: string;
  decorative?: boolean;
  is_cover?: boolean;
  focal_x?: number | null;
  focal_y?: number | null;
  crops?: NormalizedMediaCrop[];
  created_timestamp?: string;
  updated_timestamp?: string;
};

export type EventMediaSummary = {
  total_count: number;
  image_count: number;
  video_count: number;
  audio_count: number;
  cover?: EventMediaAttachment | null;
  previews?: EventMediaAttachment[];
};

export type EventChapterHeader = {
  id: ApiId | null;
  is_projection?: boolean;
  title: string;
  position: number;
  start_timestamp?: string | null;
  end_timestamp?: string | null;
  location_label?: string | null;
  effective_location_label?: string | null;
  effective_start_timestamp?: string | null;
  effective_end_timestamp?: string | null;
  inherits_event_participants?: boolean;
  participant_count?: number;
  participant_preview?: ContactListItem[];
  media_count?: number;
  thumbnail?: EventMediaAttachment | null;
};

export type EventChapterDetail = EventChapterHeader & {
  note?: string;
  description?: string;
  effective_participants?: ContactListItem[];
  media?: EventMediaAttachment[];
  journals?: EventJournalsSummary;
  created_timestamp?: string;
  updated_timestamp?: string;
};

export type LegacyChapterProjection = EventChapterDetail & {
  id: null;
  is_projection: true;
};

export type EventChapterMode = "projected" | "persisted";

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
  context_category_summary?: ContextCategory | null;
  interaction_mode: InteractionMode | null;
  mood: Mood | null;
  participants: EventParticipant[];
  journaled: boolean;
  journals: EventJournalsSummary;
  chapter_mode?: EventChapterMode;
  chapters?: EventChapterHeader[];
  legacy_chapter?: LegacyChapterProjection | null;
  media?: EventMediaAttachment[];
  media_summary?: EventMediaSummary;
};

export type EventDetailDTO = Event;

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

export type CreateEventChapterRequest = {
  title: string;
  start_timestamp?: string | null;
  end_timestamp?: string | null;
  location_label?: string;
  note?: string;
  inherits_event_participants?: boolean;
  participant_ids?: ApiId[];
};

export type UpdateEventChapterRequest = Partial<CreateEventChapterRequest>;

export type AttachEventMediaRequest = {
  media_asset_id: ApiId;
  chapter_id?: ApiId | null;
  recorded_at?: string | null;
  alt_text?: string;
  caption?: string;
  decorative?: boolean;
  is_cover?: boolean;
  focal_x?: number;
  focal_y?: number;
  crops?: NormalizedMediaCrop[];
};

export type UpdateEventMediaRequest = Partial<
  Omit<AttachEventMediaRequest, "media_asset_id" | "chapter_id">
>;
