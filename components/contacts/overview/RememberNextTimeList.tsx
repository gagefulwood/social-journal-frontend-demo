import { Bookmark } from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RememberNextTimeListProps = {
  model: ContactOverviewModel;
};

export function RememberNextTimeList({ model }: RememberNextTimeListProps) {
  if (model.rememberNextTimeItems.length === 0) {
    return (
      <ContactOverviewEmptyState
        icon={<Bookmark className="size-4" />}
        title="No remembered context yet"
        copy="Pinned facts and observations will appear here when that system is added."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {model.rememberNextTimeItems.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-2 text-sm"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
          <p className="line-clamp-2 min-w-0 leading-6">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
