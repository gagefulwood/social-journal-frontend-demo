"use client";

import { DashboardEventList } from "@/components/dashboard/DashboardEventList";
import type { WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import type { DashboardEvent } from "@/types/dashboard";

type RecentEventsWidgetProps = WidgetStateProps & {
  events: DashboardEvent[];
};

export function RecentEventsWidget(props: RecentEventsWidgetProps) {
  return (
    <DashboardEventList
      description="A few recent moments to pick back up from."
      variant="recent"
      {...props}
    />
  );
}
