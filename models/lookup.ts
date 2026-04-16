export type Occupation =
  | "Student"
  | "Engineer"
  | "Designer"
  | "Manager"
  | "Other";

export type EducationLevel =
  | "HighSchool"
  | "Bachelors"
  | "Masters"
  | "PhD"
  | "Other";

export type ClosenessScore = number;

export type Mood =
  | "Happy"
  | "Neutral"
  | "Sad"
  | "Excited"
  | "Stressed";

export type ContextCategory =
  | "Work"
  | "Family"
  | "Friends"
  | "Networking"
  | "Other";


export interface DetailCategory {
  id: string;
  name: string;
  children?: DetailCategory[];
}

export type NoteMarker =
  | "Important"
  | "FollowUp"
  | "Idea"
  | "Reminder";

export type MediaType =
  | "Image"
  | "Video"
  | "Audio"
  | "Document";