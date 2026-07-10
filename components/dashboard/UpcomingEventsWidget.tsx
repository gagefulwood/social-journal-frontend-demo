"use client";

import { DashboardEventList } from "@/components/dashboard/DashboardEventList";
import type { WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import type { DashboardEvent } from "@/types/dashboard";

type UpcomingEventsWidgetProps = WidgetStateProps & {
  events: DashboardEvent[];
};

export function UpcomingEventsWidget(props: UpcomingEventsWidgetProps) {
  return (
    <DashboardEventList
      description="Planned moments on your calendar."
      variant="upcoming"
      {...props}
    />
  );
}
