import { create } from "zustand";
import type { ApiId } from "@/types/api";

type ContactsStoreState = {
  activeContactId: ApiId | null;
  setActiveContact: (id: ApiId | null) => void;
  clearActiveContact: () => void;
};

export const useContactsStore = create<ContactsStoreState>((set) => ({
  activeContactId: null,
  setActiveContact: (id) => set({ activeContactId: id }),
  clearActiveContact: () => set({ activeContactId: null }),
}));
