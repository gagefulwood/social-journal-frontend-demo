export type JournalDateTimePresentation = {
  date: string;
  time: string;
  combined: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function getJournalDateTimePresentation(
  value: string,
): JournalDateTimePresentation | null {
  const parts = parseLocalDateTime(value);
  if (!parts) return null;

  const date = `${MONTHS[parts.month - 1]} ${parts.day}, ${parts.year}`;
  const twelveHour = parts.hour % 12 || 12;
  const meridiem = parts.hour >= 12 ? "PM" : "AM";
  const time = `${twelveHour}:${String(parts.minute).padStart(2, "0")} ${meridiem}`;

  return { date, time, combined: `${date}\u00a0·\u00a0${time}` };
}

export function getJournalRelativeDateLabel(
  value: string,
  now = new Date(),
): "Today" | "Yesterday" | null {
  const parts = parseLocalDateTime(value);
  if (!parts) return null;

  const selectedDay = Date.UTC(parts.year, parts.month - 1, parts.day);
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const difference = Math.round((currentDay - selectedDay) / 86_400_000);

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  return null;
}

export function getJournalDurationLabel({
  startedAt,
  endedAt,
  ongoing,
}: {
  startedAt: string;
  endedAt: string;
  ongoing: boolean;
}): string | null {
  if (ongoing) return "In progress";
  if (!startedAt || !endedAt) return null;

  const start = new Date(startedAt);
  const end = new Date(endedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const durationMinutes = Math.round(
    (end.getTime() - start.getTime()) / 60_000,
  );
  if (durationMinutes < 0) return null;
  if (durationMinutes < 60) {
    return `${durationMinutes} ${durationMinutes === 1 ? "minute" : "minutes"}`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (!minutes) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours} hr ${minutes} min`;
}

function parseLocalDateTime(value: string): LocalDateTimeParts | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?$/.exec(
      value,
    );
  if (!match) return null;

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match;
  const parts: LocalDateTimeParts = {
    year: Number(yearValue),
    month: Number(monthValue),
    day: Number(dayValue),
    hour: Number(hourValue),
    minute: Number(minuteValue),
  };
  const candidate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute),
  );
  if (
    candidate.getUTCFullYear() !== parts.year ||
    candidate.getUTCMonth() !== parts.month - 1 ||
    candidate.getUTCDate() !== parts.day ||
    candidate.getUTCHours() !== parts.hour ||
    candidate.getUTCMinutes() !== parts.minute
  ) {
    return null;
  }

  return parts;
}
