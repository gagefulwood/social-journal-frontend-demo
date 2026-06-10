import { Pin } from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RememberNextTimeListProps = {
  model: ContactOverviewModel;
};

export function RememberNextTimeList({ model }: RememberNextTimeListProps) {
  if (model.rememberNextTimeItems.length === 0) {
    return (
      <ContactOverviewEmptyState
        icon={<Pin className="size-4" />}
        title="Add one thing to remember"
        copy="Save a quick note to help you stay present next time."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {model.rememberNextTimeItems.map((item) => (
        <li
          key={item.id}
          title={item.fullText}
          className="flex items-start gap-2 text-sm"
        >
          <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Pin className="size-2.5" />
          </span>
          <p className="line-clamp-2 min-w-0 leading-6">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
