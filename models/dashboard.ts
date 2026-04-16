export interface HeatmapCell {
  date: string;
  value: number;
}

export interface DecayContact {
  contactId: string;
  name: string;
  score: number;
}

export interface ActivityStats {
  totalEvents: number;
  thisWeek: number;
  thisMonth?: number;
}

export interface NetworkPulseGroup {
  groupName: string;
  count: number;
}

export interface DashboardData {
  activityStats: ActivityStats;
  recentEvents: any[]; 
  upcomingEvents: any[];
  decayRadar: DecayContact[];
}