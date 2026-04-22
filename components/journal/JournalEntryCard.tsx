import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntryPreview } from "@/models/events";
import Link from "next/link";

export function JournalEntryCard({
  entry,
}: {
  entry: JournalEntryPreview;
}) {
  const formattedDate = new Date(entry.entry_timestamp).toLocaleDateString(
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
          <div className="flex items-center gap-2">
            {entry.mood && (
              <span className="text-base">{entry.mood.emoji_icon}</span>
            )}
            <p className="font-medium">{entry.title}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </p>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  {tag.tag_name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}