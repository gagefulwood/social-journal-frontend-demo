import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntryPreview } from "@/models/events";
import Link from "next/link";

export function JournalEntryCard({
  entry,
}: {
  entry: JournalEntryPreview;
}) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Link href={`/journal/${entry.id}`}>
      <Card className="hover:shadow-md transition cursor-pointer">
        <CardContent className="p-4">
          <p className="font-medium">{entry.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}