import type { ApiId } from "@/types/api";
import type { EventListItem } from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

export type InteractionHeatmapDay = {
  date: string;
  count: number;
};

export type DashboardDecayContact = {
  contact_id: ApiId;
  name: string;
  last_interaction_date: string;
  days_since: number;
  relationship_trend: "fading" | "dormant";
  connection_strength: number;
};

export type DashboardEntryKindCounts = {
  log: number;
  reflection: number;
};

export type DashboardActivityStats = {
  entries_total: number;
  entries_30d: number;
  entries_by_kind_30d: DashboardEntryKindCounts;
  events_30d: number;
  current_streak_days: number;
};

export type DashboardEvent = Pick<
  EventListItem,
  | "id"
  | "title"
  | "event_timestamp"
  | "tier"
  | "participant_count"
  | "journaled"
> & {
  context_category: ContextCategory | null;
  journaled: boolean;
};

export type DashboardPayload = {
  interaction_heatmap: InteractionHeatmapDay[];
  upcoming_events: DashboardEvent[];
  recent_events: DashboardEvent[];
  activity_stats: DashboardActivityStats;
  decay_radar: DashboardDecayContact[];
};
