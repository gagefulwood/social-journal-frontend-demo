import type { EventSummary } from './events';
import type { ContactSummary } from './contacts';

export type ActivityStats = {
  total_this_month: number;
  trend_percent: number;
};

export type DecayContact = {
  contact: ContactSummary;
  days_since_interaction: number;
};

export type DashboardData = {
  activity_stats: ActivityStats;
  recent_events: EventSummary[];
  upcoming_events: EventSummary[];
  decay_radar: DecayContact[];
};