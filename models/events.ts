export interface Event {
  id: number;
  title: string;
  scheduled_at: string;
  notes?: string;
  context_category?: number | null;
  mood?: number | null;
}


export interface JournalEntry {
  id: number;
  title: string;
  body: string;
  is_immutable: boolean;
  created_at: string;
}

export interface JournalEntryPreview {
  id: number;
  title: string;
  created_at: string;
}