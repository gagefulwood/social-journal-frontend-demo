import api from "@/lib/api/client";
import type { ContactDetail } from "@/models/contactDetails";

// Types

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
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
  closeness_score?: {
    id: number;
    name: string;
  } | null;
};

export type ContactListItem = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  trust_score: number;
  closeness_score?: {
    id: number;
    name: string;
  } | null;
};

export type Note = {
  id: string;
  body: string;
  marker?: string | null;
  created_timestamp: string;
  is_active: boolean;
};

export type Event = {
  id: number;
  title: string;
  scheduled_at: string;
  mood?: string | null;
};

// Contacts API

export const contactsApi = {
  /**
   * GET /api/contacts/
   * Returns paginated list of the authenticated user's contacts.
   * Supports optional name search and filtering.
   */
  async list(filters?: {
    name?: string;
    occupation_id?: number;
    closeness_score_id?: number;
  }): Promise<{ count: number; results: ContactListItem[] }> {
    const res = await api.get('/api/contacts/', { params: filters });
    return res.data;
  },

  /**
   * GET /api/contacts/{id}/
   * Returns full detail for a single contact.
   */
  async get(id: string): Promise<Contact> {
    const res = await api.get(`/api/contacts/${id}/`);
    return res.data;
  },

  /**
   * POST /api/contacts/
   * Creates a new contact. user is set server-side from a request.user.
   */
  async create(data: Partial<Contact>): Promise<Contact> {
    const res = await api.post(`/api/contacts/`, data);
    return res.data;
  },

  /**
   * PATCH /api/contacts/{id}/
   * Updates allowed fields on an existing contact.
   */
  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const res = await api.patch(`/api/contacts/${id}/`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/contacts/${id}/`);
  },

  // Personal Details

  /**
   * GET /api/contacts/{contactId}/details/
   * Returns all personal detail rows for a contact.
   */
  async listDetails(contactId: string): Promise<ContactDetail[]> {
    const res = await api.get(`/api/contacts/${contactId}/details/`);
    return res.data;
  },

  /**
   * POST /api/contacts/{contactId}/details/
   * Creates a new personal detail row for a contact.
   */
  async createDetail(
    contactId: string,
    data: { category: number; detail_value: string }
  ): Promise<ContactDetail> {
    const res = await api.post(`/api/contacts/${contactId}/details/`, data);
    return res.data;
  },

  /**
   * PATCH /api/contacts/{contactId}/details/{detailId}/
   * Updates a personal detail row.
   */
  async updateDetail(
    contactId: string,
    detailId: string,
    data: { detail_value: string }
  ): Promise<ContactDetail> {
    const res = await api.patch(
      `/api/contacts/${contactId}/details/${detailId}/`,
      data
    );
    return res.data;
  },

  /**
   * DELETE /api/contacts/{contactId}/details/{detailId}/
   */
  async deleteDetail(contactId: string, detailId: string): Promise<void> {
    await api.delete(`/api/contacts/${contactId}/details/${detailId}/`);
  },

  // Loose Notes

  /**
   * GET /api/contacts/{contactId}/notes/
   * Returns all loose notes for a contact.
   */
  async listNotes(contactId: string): Promise<Note[]> {
    const res = await api.get(`/api/contacts/${contactId}/notes/`);
    return res.data;
  },

  /**
   * POST /api/contacts/{contactId}/notes/
   * Creates a new loose note for a contact.
   */
  async createNote(
    contactId: string,
    data: { marker?: number; body: string }
  ): Promise<Note> {
    const res = await api.post(`/api/contacts/${contactId}/notes/`, data);
    return res.data;
  },

  /**
   * PATCH /api/contacts/{contactId}/notes/{noteId}/
   * Updates a loose note.
   */
  async updateNote(
    contactId: string,
    noteId: string,
    data: { body?: string; is_active?: boolean }
  ): Promise<Note> {
    const res = await api.patch(
      `/api/contacts/${contactId}/notes/${noteId}/`,
      data
    );
    return res.data;
  },

  /**
   * DELETE /api/contacts/{contactId}/notes/{noteId}/
   */
  async deleteNote(contactId: string, noteId: string): Promise<void> {
    await api.delete(`/api/contacts/${contactId}/notes/${noteId}/`);
  },
};
  /** temporarily took out until api is updated to accomodate
   async listEvents(contactId: number): Promise<Event[]> {
    const res = await axios.get(`${API_URL}/events`, {
      params: { contact: contactId, limit: 5 },
    });
    return res.data;
  },
   */
