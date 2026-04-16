export type Contact = {
  id: number;
  name: string;
  role: string;
  closeness?: string;
  trustScore?: number;
};

export const contactsApi = {
  async getAll(query?: string): Promise<Contact[]> {
    console.log("search:", query);

    return [
      { id: 1, name: "John Doe", role: "Friend" },
      { id: 2, name: "Jane Smith", role: "Coworker" },
    ];
  },

  async getById(id: string): Promise<Contact> {
    console.log("get contact:", id);

    return {
      id: Number(id),
      name: "John Doe",
      role: "Friend",
      closeness: "Close",
      trustScore: 70,
    };
  },

  async update(id: string, data: Partial<Contact>): Promise<void> {
    console.log("update:", id, data);
  },

  async getRecentEvents(
    id: string
  ): Promise<{ id: number; title: string; date: string }[]> {
    console.log("events for:", id);
    return [];
  },

  async getDetails(
    id: string
  ): Promise<Record<string, { id: number; label: string; value: string }[]>> {
    console.log("details for:", id);
    return {};
  },

  async getNotes(id: string): Promise<{ id: number; text: string }[]> {
    console.log("notes for:", id);
    return [];
  },

  async addNote(id: string, data: { text: string }): Promise<void> {
    console.log("add note:", id, data);
  },
};