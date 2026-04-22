import type { ContextCategory, Mood, JournalTag } from './lookup';
import type { ContactSummary } from './contacts';

export type EventParticipant = {
  id: string;
  contact: ContactSummary;
};

export type Event = {
  id: string;
  user: string;
  title: string;
  event_timestamp: string; // ISO datetime
  context_category?: ContextCategory | null;
  participants: EventParticipant[];
};

// Lightweight version returned by GET /api/events/ list view
export type EventSummary = {
  id: string;
  title: string;
  event_timestamp: string;
  context_category?: ContextCategory | null;
  participant_count: number;
};

export type JournalEntry = {
  id: string;
  event?: string | null;
  user: string;
  title: string;
  body: string;
  mood?: Mood | null;
  tags: JournalTag[];
  entry_timestamp: string;
  is_immutable: boolean;
};

// Lightweight version returned by GET /api/journal/entries/ list view
export type JournalEntryPreview = {
  id: string;
  title: string;
  entry_timestamp: string;
  mood?: Mood | null;
  tags: JournalTag[];
};

export type Reflection = {
  id: string;
  journal_entry: string;
  body: string;
  created_timestamp: string;
};