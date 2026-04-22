import { create } from "zustand";
import { contactsApi } from "@/lib/api/contactsApi";
import type { ContactSummary } from "@/models/contacts";

type Filters = {
  name?: string;
  occupation_id?: number;
  closeness_score_id?: number;
};

interface ContactsState {
  contacts: ContactSummary[];
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
      set({ contacts: data.results, isLoading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch contacts",
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