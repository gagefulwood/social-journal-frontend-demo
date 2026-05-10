import type { ApiId } from "@/types/api";
import type { Log, LogListItem, EntryKind, Reflection, ReflectionListItem, ExerciseListItem, Exercise, } from "@/types/journals";
import type { FactCategory } from "@/types/lookups";

export function logTitle(log: Log | LogListItem) {
  return log.title;
}

export function logDate(log: Log | LogListItem) {
    return new Date(log.created_timestamp);
}

export function logSubtype(log: Log | LogListItem) {
    return log.subtype;
}