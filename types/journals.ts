import type { ApiId, JsonObject, PaginatedResponse } from "@/types/api";
import type { EntryTag, Mood } from "@/types/lookups";

export type EntryKind = "log" | "reflection" | "exercise";

export type LogListItem = {
  id: ApiId;
  kind: "log";
  event: ApiId;
  title: string;
  mood: Mood | null;
  tags: EntryTag[];
  subtype: string;
  created_timestamp: string;
  updated_timestamp: string;
};

export type Log = LogListItem & {
  body: string;
  data: JsonObject;
};

export type ReflectionListItem = {
  id: ApiId;
  kind: "reflection";
  event: ApiId;
  subtype: string;
  clarity_check: string;
  created_timestamp: string;
  updated_timestamp: string;
};

export type Reflection = ReflectionListItem & {
  data: JsonObject;
};

export type ExerciseStep = {
  id: ApiId;
  display_order: number;
  prompt: string;
  response: string;
};

export type ExerciseListItem = {
  id: ApiId;
  kind: "exercise";
  event: ApiId;
  subtype: string;
  pre_measurement: number;
  post_measurement: number;
  measurement_delta: number;
  created_timestamp: string;
  updated_timestamp: string;
};

export type Exercise = ExerciseListItem & {
  steps: ExerciseStep[];
};

export type Entry = Log | Reflection | Exercise;

export type EntryListItem =
  | LogListItem
  | ReflectionListItem
  | ExerciseListItem;

export type CombinedLogSummary = {
  mood: ApiId | null;
  subtype: string;
  tag_count: number;
};

export type CombinedReflectionSummary = {
  subtype: string;
  clarity_check: string;
};

export type CombinedExerciseSummary = {
  subtype: string;
  measurement_delta: number;
};

export type CombinedJournalSummary =
  | CombinedLogSummary
  | CombinedReflectionSummary
  | CombinedExerciseSummary;

export type CombinedJournalFeedItem = {
  id: ApiId;
  kind: EntryKind;
  event: ApiId;
  label: string;
  created_timestamp: string;
  updated_timestamp: string;
  summary: CombinedJournalSummary;
};

export type CombinedJournalFeedResponse =
  PaginatedResponse<CombinedJournalFeedItem>;

export type CreateLogRequest = {
  event: ApiId;
  title: string;
  body: string;
  mood_id?: ApiId | null;
  tag_ids?: ApiId[];
  subtype?: string;
  data?: JsonObject;
};

export type UpdateLogRequest = Partial<CreateLogRequest>;

export type CreateReflectionRequest = {
  event: ApiId;
  subtype?: string;
  clarity_check: string;
  data?: JsonObject;
};

export type UpdateReflectionRequest = Partial<CreateReflectionRequest>;

export type CreateExerciseStepRequest = {
  display_order: number;
  prompt: string;
  response: string;
};

export type CreateExerciseRequest = {
  event: ApiId;
  subtype?: string;
  pre_measurement: number;
  post_measurement: number;
  steps?: CreateExerciseStepRequest[];
};

export type UpdateExerciseRequest = Partial<CreateExerciseRequest>;
