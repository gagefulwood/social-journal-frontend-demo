export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactSummary {
  id: string;
  name: string;
  email: string;
  closenessScore?: number;
}

export interface ContactPersonalDetail {
  id: string;
  contactId: string;
  category: string;
  value: string;
  createdAt?: string;
}

export interface ContactLooseNote {
  id: string;
  contactId: string;
  content: string;
  createdAt?: string;
}