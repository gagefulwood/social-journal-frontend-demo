import { create } from 'zustand';
import type { ApiId } from '@/types/api';

type EventsStoreState = {
  activeEventId: ApiId | null;
  setActiveEvent: (id: ApiId | null) => void;
  clearActiveEvent: () => void;
};

export const useEventsStore = create<EventsStoreState>((set) => ({
  activeEventId: null,
  setActiveEvent: (id) => set({ activeEventId: id }),
  clearActiveEvent: () => set({ activeEventId: null }),
}));

