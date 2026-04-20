import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


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


export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const res = await axios.get(`${API_URL}/dashboard/`);
    return res.data;
  },
};