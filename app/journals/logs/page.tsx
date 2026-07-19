import { redirect } from "next/navigation";

type JournalLogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JournalLogsPage({
  searchParams,
}: JournalLogsPageProps) {
  const params = new URLSearchParams();
  const current = await searchParams;

  for (const [key, value] of Object.entries(current)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) {
      params.set(key, firstValue);
    }
  }

  params.set("view", "logs");
  params.delete("page");
  redirect(`/journals?${params.toString()}`);
}
