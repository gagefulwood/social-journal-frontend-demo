import type { ApiId, PaginatedResponse } from "@/types/api";
import type { MediaAssetListItem } from "@/types/media";

export type RelationshipTrend =
  | "growing"
  | "stable"
  | "fading"
  | "dormant"
  | string;

export type SentimentProfile = Record<string, number>;

export type FactCategorySummary = {
  id: ApiId;
  name: string;
  icon_reference: string;
  parent: {
    id: ApiId;
    name: string;
  } | null;
};

export type Fact = {
  id: ApiId;
  contact: ApiId;
  category: ApiId | null;
  category_summary: FactCategorySummary | null;
  label: string | null;
  detail_value: string;
  value: string;
  is_conversation_cue: boolean;
  is_pinned: boolean;
  pinned_at: string | null;
};

export type ObservationType =
  | "notice"
  | "conversation_cue"
  | "appreciation"
  | "change"
  | null;

export type ObservationStatus = "current" | "revisit_later" | "archived";

export type ObservationEventSummary = {
  id: ApiId;
  title: string;
  event_timestamp: string;
};

export type Observation = {
  id: ApiId;
  contact: ApiId;
  marker: ApiId | null;
  body: string;
  event: ApiId | null;
  event_summary: ObservationEventSummary | null;
  observation_type: ObservationType;
  status: ObservationStatus;
  occurred_at: string | null;
  created_timestamp: string;
  archived_at: string | null;
  is_active: boolean;
  is_pinned: boolean;
  pinned_at: string | null;
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

export type ContactMethod = {
  id: ApiId;
  kind: "email" | "phone";
  label: string;
  value: string;
  is_primary: boolean;
};

export type ContactAddress = {
  id: ApiId;
  label: string;
  line_1: string;
  line_2: string;
  city: string;
  region: string;
  postal_code: string;
  country_code: string;
  is_primary: boolean;
};

export type ContactEmployment = {
  id: ApiId;
  title: string;
  organization: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
};

export type ContactEducation = {
  id: ApiId;
  credential: string;
  field_of_study: string;
  institution: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
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
  preferred_name: string;
  gender_identity: string;
  pronouns: string;
  birth_date: string | null;
  age: number | null;
  timezone: string;
  first_met_on: string | null;
  met_through: string;
  met_location: string;
  contact_methods: ContactMethod[];
  addresses: ContactAddress[];
  employment: ContactEmployment[];
  education: ContactEducation[];
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
export type FactListResponse = PaginatedResponse<Fact>;
export type ObservationListResponse = PaginatedResponse<Observation>;

export type CreateContactRequest = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  birthday?: string | null;
  first_met_date?: string | null;
  preferred_name?: string;
  gender_identity?: string;
  pronouns?: string;
  birth_date?: string | null;
  timezone?: string;
  first_met_on?: string | null;
  met_through?: string;
  met_location?: string;
  contact_methods?: Array<Omit<ContactMethod, "id"> & { id?: ApiId }>;
  addresses?: Array<Omit<ContactAddress, "id"> & { id?: ApiId }>;
  employment?: Array<Omit<ContactEmployment, "id"> & { id?: ApiId }>;
  education?: Array<Omit<ContactEducation, "id"> & { id?: ApiId }>;
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
  label?: string | null;
  detail_value: string;
  is_conversation_cue?: boolean;
};

export type UpdateFactRequest = Partial<CreateFactRequest>;

export type CreateObservationRequest = {
  marker?: ApiId | null;
  body: string;
  observation_type?: Exclude<ObservationType, null> | null;
  status?: ObservationStatus;
  occurred_at?: string | null;
  event?: ApiId | null;
};

export type UpdateObservationRequest = Partial<CreateObservationRequest>;

export type FactListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  category?: ApiId;
  is_conversation_cue?: boolean;
  pinned?: boolean;
  ordering?: "pinned_at" | "-pinned_at";
};

export type ObservationListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: ObservationStatus;
  observation_type?: Exclude<ObservationType, null>;
  marker?: ApiId;
  event?: ApiId;
  occurred_after?: string;
  occurred_before?: string;
  created_after?: string;
  created_before?: string;
  pinned?: boolean;
  ordering?: "pinned_at" | "-pinned_at";
};
