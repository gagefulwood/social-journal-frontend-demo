export type ActivityStats = {
  total_events: number;
  this_week: number;
  this_month: number;
  trend_percentage: number;
};

export type DashboardEvent = {
  id: number;
  title: string;
  scheduled_at: string;
  context_category?: number | null;
  mood?: string | null;
};

export type DecayContact = {
  contact_id: number;
  first_name: string;
  last_name: string;
  days_since_last_event: number;
};

export type DashboardData = {
  activity_stats: ActivityStats;
  recent_events: DashboardEvent[];
  upcoming_events: DashboardEvent[];
  decay_radar: DecayContact[];
};