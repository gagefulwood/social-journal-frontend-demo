import type { ApiId } from "@/types/api";

export type MoodPolarity = "positive" | "neutral" | "negative" | string;

export type Mood = {
  id: ApiId;
  name: string;
  emoji_icon: string;
  polarity: MoodPolarity;
  is_system_default: boolean;
};

export type ContextCategory = {
  id: ApiId;
  name: string;
  color: string;
  is_system_default: boolean;
};

export type FactCategory = {
  id: ApiId;
  name: string;
  icon_reference: string;
  parent: ApiId | null;
  is_system_default: boolean;
  children: FactCategory[];
};

export type ObservationMarker = {
  id: ApiId;
  name: string;
  color_hex: string;
  icon_reference: string;
};

export type EntryTag = {
  id: ApiId;
  tag_name: string;
  is_system_default: boolean;
};

export type Occupation = {
  id: ApiId;
  name: string;
  is_system_default: boolean;
};

export type Relation = {
  id: ApiId;
  name: string;
  is_system_default: boolean;
};

export type EducationLevel = {
  id: ApiId;
  name: string;
  is_system_default: boolean;
};

export type MediaType = {
  id: ApiId;
  name: string;
};

export type Event = {
  id: ApiId;
  title: string;
};