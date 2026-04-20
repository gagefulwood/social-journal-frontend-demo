import { create } from "zustand";
import { contactsApi, Contact } from "@/lib/api/contactsApi";

type Filters = {
  search?: string;
};

interface ContactsState {
  contacts: Contact[];
  filters: Filters;

  isLoading: boolean;
  error: string | null;

  fetchContacts: () => Promise<void>;
  setFilter: (filters: Partial<Filters>) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  filters: {},

  isLoading: false,
  error: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await contactsApi.list(get().filters);
      set({ contacts: data, isLoading: false });
    } catch (err: unknown) {
      let message = "Failed to fetch contacts";

      if (err instanceof Error) {
        message = err.message;
      }

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  setFilter: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });

    get().fetchContacts();
  },
}));