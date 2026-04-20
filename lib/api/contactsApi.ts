import axios from "axios";
import type { ContactDetail } from "@/models/contactDetails";

const API_URL = process.env.NEXT_PUBLIC_API_URL;



export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  nickname?: string | null;
  email?: string;
  phone_number?: string;
  trust_score: number;
  closeness_score?: number | null; // optional for UI compatibility
};

export type Note = {
  id: number;
  body: string;
  marker?: string | null;
};

export type Event = {
  id: number;
  title: string;
  scheduled_at: string;
  mood?: string | null;
};



export const contactsApi = {

  async list(filters?: { search?: string }): Promise<Contact[]> {
    const res = await axios.get(`${API_URL}/contacts`, {
      params: filters?.search ? { search: filters.search } : {},
    });
    return res.data;
  },


  async getAll(query?: string): Promise<Contact[]> {
    const res = await axios.get(`${API_URL}/contacts`, {
      params: query ? { search: query } : {},
    });
    return res.data;
  },

  async get(id: number): Promise<Contact> {
    const res = await axios.get(`${API_URL}/contacts/${id}`);
    return res.data;
  },

  async create(data: Partial<Contact>): Promise<Contact> {
    const res = await axios.post(`${API_URL}/contacts`, data);
    return res.data;
  },

  async update(id: number, data: Partial<Contact>): Promise<Contact> {
    const res = await axios.patch(`${API_URL}/contacts/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/contacts/${id}`);
  },



  async listDetails(contactId: number): Promise<ContactDetail[]> {
    const res = await axios.get(
      `${API_URL}/contacts/${contactId}/details`
    );
    return res.data;
  },

  async createDetail(data: {
    contact: number;
    category: number;
    value: string;
  }): Promise<ContactDetail> {
    const res = await axios.post(`${API_URL}/contact-details`, data);
    return res.data;
  },



  async listNotes(contactId: number): Promise<Note[]> {
    const res = await axios.get(
      `${API_URL}/contacts/${contactId}/notes`
    );
    return res.data;
  },

  async createNote(data: {
    contact: number;
    body: string;
  }): Promise<Note> {
    const res = await axios.post(`${API_URL}/notes`, data);
    return res.data;
  },


  async listEvents(contactId: number): Promise<Event[]> {
    const res = await axios.get(`${API_URL}/events`, {
      params: { contact: contactId, limit: 5 },
    });
    return res.data;
  },
};