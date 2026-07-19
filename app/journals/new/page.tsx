import { redirect } from "next/navigation";

type NewJournalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewJournalPage({
  searchParams,
}: NewJournalPageProps) {
  const current = await searchParams;
  const params = new URLSearchParams({ new: "1" });

  for (const key of ["event", "contact"] as const) {
    const value = current[key];
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) {
      params.set(key, firstValue);
    }
  }

  redirect(`/journals?${params.toString()}`);
}
