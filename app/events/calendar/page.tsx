import { redirect } from "next/navigation";

type LegacyEventCalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyEventCalendarPage({
  searchParams,
}: LegacyEventCalendarPageProps) {
  const params = new URLSearchParams();
  const current = await searchParams;

  for (const [key, value] of Object.entries(current)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) {
      params.set(key, firstValue);
    }
  }

  params.set("view", "calendar");
  redirect(`/events?${params.toString()}`);
}
