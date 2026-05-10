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

export function reflectionTitle(reflection: Reflection | ReflectionListItem) {
    return reflection.subtype;
}

export function reflectionDate(reflection: Reflection | ReflectionListItem) {
    return new Date(reflection.created_timestamp);
}

export function ExerciseTitle(exercise: Exercise | ExerciseListItem) {
    return exercise.subtype;
}

export function ExerciseDate(exercise: Exercise | ExerciseListItem) {
    return new Date(exercise.created_timestamp);
}