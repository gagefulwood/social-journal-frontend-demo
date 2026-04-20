import { AppShell } from "@/components/layout/AppShell";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell title="Events">{children}</AppShell>;
}