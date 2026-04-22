import type { ClosenessScore } from './lookup';

export type Contact = {
  id: string;
  user: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  birthday?: string | null;
  first_met_date?: string | null;
  occupation?: number | null;
  custom_occupation?: string | null;
  company?: string | null;
  education_level?: number | null;
  custom_education_level?: string | null;
  school?: string | null;
  trust_score: number;
  closeness_score?: ClosenessScore | null;
};

// Lightweight version returned by GET /api/contacts/ list view
export type ContactSummary = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  trust_score: number;
  closeness_score?: ClosenessScore | null;
};

export type ContactPersonalDetail = {
  id: string;
  contact: string;
  category: number;
  detail_value: string;
};

export type ContactLooseNote = {
  id: string;
  contact: string;
  marker?: number | null;
  body: string;
  created_timestamp: string;
  is_active: boolean;
};