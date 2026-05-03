import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  Contact,
  ContactListResponse,
  CreateContactRequest,
  CreateFactRequest,
  CreateObservationRequest,
  Fact,
  Observation,
  UpdateContactRequest,
  UpdateFactRequest,
  UpdateObservationRequest,
} from "@/types/contacts";

type MaybePaginated<TItem> = TItem[] | { results: TItem[] };

export type ContactListParams = {
  page?: number;
  page_size?: number;
  name?: string;
  occupation?: ApiId;
};

function normalizeList<TItem>(data: MaybePaginated<TItem>): TItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.results) ? data.results : [];
}

export const contactsApi = {
  async list(params?: ContactListParams): Promise<ContactListResponse> {
    const res = await api.get<ContactListResponse>("/api/contacts/", {
      params,
    });
    return res.data;
  },

  async get(id: ApiId): Promise<Contact> {
    const res = await api.get<Contact>(`/api/contacts/${id}/`);
    return res.data;
  },

  async create(data: CreateContactRequest): Promise<Contact> {
    const res = await api.post<Contact>("/api/contacts/", data);
    return res.data;
  },

  async patch(id: ApiId, data: UpdateContactRequest): Promise<Contact> {
    const res = await api.patch<Contact>(`/api/contacts/${id}/`, data);
    return res.data;
  },

  async remove(id: ApiId): Promise<void> {
    await api.delete(`/api/contacts/${id}/`);
  },

  async listFacts(contactId: ApiId): Promise<Fact[]> {
    const res = await api.get<MaybePaginated<Fact>>(
      `/api/contacts/${contactId}/facts/`
    );
    return normalizeList(res.data);
  },

  async getFact(contactId: ApiId, factId: ApiId): Promise<Fact> {
    const res = await api.get<Fact>(
      `/api/contacts/${contactId}/facts/${factId}/`
    );
    return res.data;
  },

  async createFact(contactId: ApiId, data: CreateFactRequest): Promise<Fact> {
    const res = await api.post<Fact>(
      `/api/contacts/${contactId}/facts/`,
      data
    );
    return res.data;
  },

  async patchFact(
    contactId: ApiId,
    factId: ApiId,
    data: UpdateFactRequest
  ): Promise<Fact> {
    const res = await api.patch<Fact>(
      `/api/contacts/${contactId}/facts/${factId}/`,
      data
    );
    return res.data;
  },

  async removeFact(contactId: ApiId, factId: ApiId): Promise<void> {
    await api.delete(`/api/contacts/${contactId}/facts/${factId}/`);
  },

  async listObservations(contactId: ApiId): Promise<Observation[]> {
    const res = await api.get<MaybePaginated<Observation>>(
      `/api/contacts/${contactId}/observations/`
    );
    return normalizeList(res.data);
  },

  async getObservation(
    contactId: ApiId,
    observationId: ApiId
  ): Promise<Observation> {
    const res = await api.get<Observation>(
      `/api/contacts/${contactId}/observations/${observationId}/`
    );
    return res.data;
  },

  async createObservation(
    contactId: ApiId,
    data: CreateObservationRequest
  ): Promise<Observation> {
    const res = await api.post<Observation>(
      `/api/contacts/${contactId}/observations/`,
      data
    );
    return res.data;
  },

  async patchObservation(
    contactId: ApiId,
    observationId: ApiId,
    data: UpdateObservationRequest
  ): Promise<Observation> {
    const res = await api.patch<Observation>(
      `/api/contacts/${contactId}/observations/${observationId}/`,
      data
    );
    return res.data;
  },

  async removeObservation(
    contactId: ApiId,
    observationId: ApiId
  ): Promise<void> {
    await api.delete(
      `/api/contacts/${contactId}/observations/${observationId}/`
    );
  },
};
