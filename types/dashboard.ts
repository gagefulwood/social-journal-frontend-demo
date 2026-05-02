import type { ApiId } from "@/types/api";
import type { RelationshipTrend } from "@/types/contacts";
import type { EventTier } from "@/types/events";
import type { EntryKind } from "@/types/journals";
import type { ContextCategory } from "@/types/lookups";

export type InteractionHeatmapDay = {
  date: string;
  count: number;
};

export type DecayContact = {
  contact_id: ApiId;
  name: string;
  last_interaction_date: string;
  days_since: number;
  relationship_trend: RelationshipTrend;
  connection_strength: number;
};

export type ActivityStats = {
  entries_total: number;
  entries_30d: number;
  entries_by_kind_30d: Record<EntryKind, number>;
  events_30d: number;
  current_streak_days: number;
};

export type DashboardEvent = {
  id: ApiId;
  title: string;
  event_timestamp: string;
  tier: EventTier;
  context_category: ContextCategory | null;
  participant_count: number;
  journaled: boolean;
};

export type DashboardPayload = {
  interaction_heatmap: InteractionHeatmapDay[];
  upcoming_events: DashboardEvent[];
  recent_events: DashboardEvent[];
  activity_stats: ActivityStats;
  decay_radar: DecayContact[];
};
