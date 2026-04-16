import { create } from "zustand";
import { contactsApi } from "@/lib/api/contactsApi";
import { ContactSummary, Contact } from "@/models";

interface Filters {
  search?: string;
}

interface ContactsState {
  contacts: ContactSummary[];
  selectedContact: Contact | null;
  filters: Filters;

  isLoading: boolean;
  error: string | null;

  fetchContacts: () => Promise<void>;
  setFilter: (filters: Partial<Filters>) => void;
  setSelectedContact: (contact: Contact | null) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  selectedContact: null,
  filters: {},

  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await contactsApi.list(get().filters);
      set({ contacts: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch contacts",
        isLoading: false,
      });
    }
  },

  setFilter: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });

    // 🔥 triggers re-fetch
    get().fetchContacts();
  },

  setSelectedContact: (contact) => set({ selectedContact: contact }),
}));