import type { ApiId, PaginatedResponse } from "@/types/api";
import type { MediaAssetListItem } from "@/types/media";

export type RelationshipTrend =
  | "growing"
  | "stable"
  | "fading"
  | "dormant"
  | string;

export type SentimentProfile = Record<string, number>;

export type Fact = {
  id: ApiId;
  contact: ApiId;
  category: ApiId | null;
  detail_value: string;
};

export type Observation = {
  id: ApiId;
  contact: ApiId;
  marker: ApiId | null;
  body: string;
  created_timestamp: string;
  is_active: boolean;
};

export type ContactListItem = {
  id: ApiId;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  relation: ApiId | null;
  relation_name: string | null;
  occupation: ApiId | null;
  occupation_name: string | null;
  profile_picture: MediaAssetListItem | null;
  interaction_frequency_score: number;
  relationship_trend: RelationshipTrend;
  connection_strength: number;
};

export type Contact = {
  id: ApiId;
  user: ApiId;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  birthday: string | null;
  first_met_date: string | null;
  relation: ApiId | null;
  relation_name: string | null;
  occupation: ApiId | null;
  occupation_name: string | null;
  custom_occupation: string;
  company: string;
  education_level: ApiId | null;
  custom_education_level: string;
  school: string;
  profile_picture: MediaAssetListItem | null;
  interaction_frequency_score: number;
  relationship_trend: RelationshipTrend;
  interaction_diversity_score: number;
  sentiment_profile: SentimentProfile;
  connection_strength: number;
};

export type ContactListResponse = PaginatedResponse<ContactListItem>;

export type CreateContactRequest = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  birthday?: string | null;
  first_met_date?: string | null;
  relation?: ApiId | null;
  occupation?: ApiId | null;
  custom_occupation?: string;
  company?: string;
  education_level?: ApiId | null;
  custom_education_level?: string;
  school?: string;
  profile_picture_id?: ApiId | null;
};

export type UpdateContactRequest = Partial<CreateContactRequest>;

export type CreateFactRequest = {
  category: ApiId | null;
  detail_value: string;
};

export type UpdateFactRequest = Partial<CreateFactRequest>;

export type CreateObservationRequest = {
  marker?: ApiId | null;
  body: string;
  is_active?: boolean;
};

export type UpdateObservationRequest = Partial<CreateObservationRequest>;
