export interface Event {
  id: string;
  contactId: string;
  type: string;
  date: string;
  notes?: string;
  createdAt?: string;
}

export interface JournalEntryPreview {
  id: string;
  title: string;
  snippet: string;
  date: string;
}