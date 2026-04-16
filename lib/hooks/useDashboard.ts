import { useEffect, useState } from "react";

type Stats = {
  total: number;
  trend: number;
};

type RecentEvent = {
  id: number;
  title: string;
  mood: string;
  tag: string;
};

type UpcomingEvent = {
  id: number;
  title: string;
  date: string;
  people: string[];
};

export type DecayContact = {
  id: number;
  name: string;
  days: number;
};

type DashboardData = {
  stats: Stats;
  recentEvents: RecentEvent[];
  upcomingEvents: UpcomingEvent[];
  decay: DecayContact[];
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setTimeout(() => {
          setData({
            stats: { total: 24, trend: -12 },
            recentEvents: [
              { id: 1, title: "Lunch", mood: "😊", tag: "Friends" },
            ],
            upcomingEvents: [
              {
                id: 1,
                title: "Meeting",
                date: "Tomorrow",
                people: ["John"],
              },
            ],
            decay: [
              { id: 1, name: "John Doe", days: 10 },
            ],
          });
          setLoading(false);
        }, 1000);
      } catch {
        setError("Failed to load dashboard");
        setLoading(false);
      }
    };

    load();
  }, []);

  return { data, loading, error };
}