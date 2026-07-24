import type { ApiId, PaginatedResponse } from "@/types/api";

export type JournalFamily = "log" | "reflection";
export type JournalStatus = "draft" | "completed";
export type JournalRelationSource = "direct" | "event" | "both";
export type LogFormat = "episode" | "social_energy" | "sentiment";
export type ReflectionLens = "interaction" | "moment" | "emotional" | "free";
export type JournalFormat = LogFormat | ReflectionLens | "legacy";

export type JournalLookupOption = {
  id: ApiId;
  code: string;
  name: string;
  icon_reference: string;
  color: string;
  is_system_default: boolean;
};

export type JournalLookupSummary = Pick<
  JournalLookupOption,
  "id" | "code" | "name"
>;

export type JournalContactSummary = {
  id: ApiId;
  display_name: string;
};

export type JournalEventSummary = {
  id: ApiId;
  title: string;
  start_timestamp: string;
  end_timestamp: string | null;
  location: string | null;
};

export type JournalChapterSummary = {
  id: ApiId;
  title: string;
  position: number;
};

export type JournalCoverSummary = {
  attachment_id: ApiId;
  media_asset_id: ApiId;
  media_type: string | null;
  file_url: string;
  alt_text: string;
};

export type JournalProgress = {
  current_step: string;
  completed_steps: number;
  total_steps: number;
  percent: number;
};

export type JournalListItem = {
  id: ApiId;
  family: JournalFamily;
  format: JournalFormat;
  status: JournalStatus;
  title: string;
  summary: string;
  event: JournalEventSummary | null;
  chapter?: JournalChapterSummary | null;
  primary_contact: JournalContactSummary | null;
  occurred_at: string | null;
  current_step: string;
  progress: JournalProgress;
  revision: number;
  created_timestamp: string;
  updated_timestamp: string;
  completed_at: string | null;
  media_count: number;
  cover: JournalCoverSummary | null;
  relation_source: JournalRelationSource | null;
};

export type JournalListResponse = PaginatedResponse<JournalListItem>;
export type CombinedJournalFeedItem = JournalListItem;
export type CombinedJournalFeedResponse = JournalListResponse;

export type JournalHubSummary = {
  draft_count: number;
  drafts: JournalListItem[];
};

export type ContactJournalSummary = {
  completed_count: number;
  log_count: number;
  reflection_count: number;
  draft_count: number;
  latest_completed: JournalListItem | null;
  drafts: JournalListItem[];
};

export type JournalFilterOptions = {
  contacts: Array<{
    id: ApiId;
    display_name: string;
  }>;
  events: Array<{
    id: ApiId;
    title: string;
  }>;
};

export type JournalAttachmentMedia = {
  id: ApiId;
  media_type: string | null;
  file_url: string;
  thumbnail_url: string | null;
  original_filename: string;
  duration_seconds: number | null;
  content_type: string;
  created_timestamp: string;
  alt_text: string;
  caption: string;
};

export type JournalAttachment = {
  id: ApiId;
  media_asset: JournalAttachmentMedia;
  is_sensitive: boolean;
  recorded_at: string | null;
  display_order: number;
  is_cover: boolean;
};

export type JournalAttachmentInput = {
  id?: ApiId;
  media_asset_id: ApiId;
  is_sensitive?: boolean;
  recorded_at?: string | null;
  display_order: number;
};

export type CarryForwardFactDraft = {
  id?: ApiId;
  target_contact_id: ApiId;
  category_id?: ApiId | null;
  label?: string | null;
  detail_value: string;
  is_conversation_cue?: boolean;
  published_fact_id?: ApiId | null;
};

export type CarryForwardObservationDraft = {
  id?: ApiId;
  target_contact_id: ApiId;
  marker_id?: ApiId | null;
  body: string;
  event_id?: ApiId | null;
  observation_type?:
    | "notice"
    | "conversation_cue"
    | "appreciation"
    | "change"
    | null;
  status?: "current" | "revisit_later" | "archived";
  occurred_at?: string | null;
  published_observation_id?: ApiId | null;
};

export type CarryForwardDrafts = {
  facts: CarryForwardFactDraft[];
  observations: CarryForwardObservationDraft[];
};

export type EpisodeDetail = {
  category_id: ApiId | null;
  ended_at: string | null;
  is_ongoing: boolean;
  characteristic_ids: ApiId[];
  context_tag_ids: ApiId[];
  category_summary?: JournalLookupSummary | null;
  characteristic_summaries?: JournalLookupSummary[];
  context_tag_summaries?: JournalLookupSummary[];
};

export type SocialEnergyDetail = {
  before_state: string;
  battery_effect: string;
  mood_shift: string;
  behavioral_effect: string;
  recovery_timing: string;
  interaction_context: string;
  group_size: number | null;
  familiarity: string;
  setting: string;
  factor_ids: ApiId[];
  factor_summaries?: JournalLookupSummary[];
};

export type SentimentDetail = {
  before_state_id: ApiId | null;
  after_state_id: ApiId | null;
  before_connection: string;
  after_connection: string;
  dynamic_ids: ApiId[];
  initiated_by: string;
  overall_exchange: string;
  before_state_summary?: JournalLookupSummary | null;
  after_state_summary?: JournalLookupSummary | null;
  dynamic_summaries?: JournalLookupSummary[];
};

export type InteractionReflectionDetail = {
  topic_or_activity: string;
  user_actions: string;
  contact_actions: string;
  contact_response: string;
  user_response: string;
  feelings_now: string;
  important_to_understand: string;
  additional_writing: string;
};

export type MomentReflectionDetail = {
  focus_moment: string;
  what_happened: string;
  noticed_around: string;
  response: string;
  stood_out: string;
  meaning_now: string;
  remember: string;
  additional_writing: string;
};

export type EmotionalManifestationKind = "thought" | "body" | "behavior";

export type EmotionalManifestation = {
  id?: ApiId;
  kind: EmotionalManifestationKind;
  text: string;
  display_order: number;
};

export type EmotionalReflectionDetail = {
  emotion_ids: ApiId[];
  situation: string;
  manifestations: EmotionalManifestation[];
  connected_factors: string;
  communicating: string;
  understanding_now: string;
  additional_writing: string;
  emotion_summaries?: JournalLookupSummary[];
};

export type FreeReflectionDetail = {
  body: string;
};

export type LogDetailByFormat = {
  episode: EpisodeDetail;
  social_energy: SocialEnergyDetail;
  sentiment: SentimentDetail;
};

export type ReflectionDetailByLens = {
  interaction: InteractionReflectionDetail;
  moment: MomentReflectionDetail;
  emotional: EmotionalReflectionDetail;
  free: FreeReflectionDetail;
};

type JournalDetailBase = {
  id: ApiId;
  family: JournalFamily;
  format: JournalFormat;
  status: JournalStatus;
  title: string;
  event: JournalEventSummary | null;
  chapter: JournalChapterSummary | null;
  primary_contact: JournalContactSummary | null;
  occurred_at: string | null;
  current_step: string;
  progress: JournalProgress;
  revision: number;
  created_timestamp: string;
  updated_timestamp: string;
  completed_at: string | null;
};

export type Log<F extends LogFormat = LogFormat> = JournalDetailBase & {
  family: "log";
  format: F;
  detail: LogDetailByFormat[F];
};

export type Reflection<L extends ReflectionLens = ReflectionLens> =
  JournalDetailBase & {
    family: "reflection";
    format: L;
    detail: ReflectionDetailByLens[L];
    contacts: JournalContactSummary[];
    attachments: JournalAttachment[];
    cover_attachment_id: ApiId | null;
    carry_forward: CarryForwardDrafts;
  };

export type JournalEntry = Log | Reflection;

export type CommonJournalWrite = {
  title?: string;
  event_id?: ApiId | null;
  chapter_id?: ApiId | null;
  primary_contact_id?: ApiId | null;
  occurred_at?: string | null;
  current_step?: string;
  expected_revision?: number;
};

export type CreateLogRequest<F extends LogFormat = LogFormat> =
  CommonJournalWrite & {
    format: F;
    detail: LogDetailByFormat[F];
  };

export type UpdateLogRequest<F extends LogFormat = LogFormat> = Partial<
  Omit<CreateLogRequest<F>, "format">
> & {
  expected_revision: number;
};

export type CreateReflectionRequest<L extends ReflectionLens = ReflectionLens> =
  CommonJournalWrite & {
    format: L;
    contact_ids?: ApiId[];
    detail: ReflectionDetailByLens[L];
    attachments?: JournalAttachmentInput[];
    cover_media_asset_id?: ApiId | null;
    carry_forward?: CarryForwardDrafts;
  };

export type UpdateReflectionRequest<L extends ReflectionLens = ReflectionLens> =
  Partial<Omit<CreateReflectionRequest<L>, "format">> & {
    expected_revision: number;
  };

export type CompleteJournalRequest = {
  expected_revision: number;
};

export type JournalFeedParams = {
  page?: number;
  page_size?: number;
  family?: JournalFamily;
  status?: JournalStatus;
  format?: JournalFormat;
  search?: string;
  contact?: ApiId;
  related_contact?: ApiId;
  event?: ApiId;
  chapter?: ApiId | "event";
  occurred_after?: string;
  occurred_before?: string;
  ordering?:
    | "updated_timestamp"
    | "-updated_timestamp"
    | "occurred_at"
    | "-occurred_at";
};

export type LogPatternResponse = {
  window: {
    days: number;
    from: string;
    to: string;
  };
  total: number;
  by_format: Record<string, number>;
  episode: {
    count: number;
    total_duration_minutes: number;
    characteristics: Array<{
      id: ApiId;
      code: string;
      name: string;
      count: number;
    }>;
  };
  social_energy: {
    count: number;
    effects: Array<{
      battery_effect: string;
      mood_shift: string;
      behavioral_effect: string;
      count: number;
    }>;
  };
  sentiment: {
    count: number;
    shifts: Array<{
      before_state: string;
      after_state: string;
      overall_exchange: string;
      count: number;
    }>;
  };
};

export type LogListItem = JournalListItem & { family: "log" };
export type ReflectionListItem = JournalListItem & { family: "reflection" };
export type LogListResponse = PaginatedResponse<LogListItem>;
export type ReflectionListResponse = PaginatedResponse<ReflectionListItem>;
