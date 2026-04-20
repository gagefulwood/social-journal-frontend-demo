"use client";

import { useEffect, useState } from "react";

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

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // simulate API delay
        await new Promise((res) => setTimeout(res, 1000));

        setData({
          activity_stats: {
            total_events: 24,
            this_week: 5,
            this_month: 12,
            trend_percentage: -12,
          },
          recent_events: [
            {
              id: 1,
              title: "Lunch",
              scheduled_at: new Date().toISOString(),
              context_category: 1,
            },
          ],
          upcoming_events: [
            {
              id: 2,
              title: "Meeting",
              scheduled_at: new Date().toISOString(),
              context_category: 2,
            },
          ],
          decay_radar: [
            {
              contact_id: 1,
              first_name: "John",
              last_name: "Doe",
              days_since_last_event: 10,
            },
          ],
        });
      } catch  {
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return { data, isLoading, error };
}