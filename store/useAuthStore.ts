import { create } from "zustand";
import type { AuthMetadata, AuthState } from "@/types/auth";

const emptyAuthMetadata: AuthMetadata = {
  userId: "",
  email: "",
  username: "",
  isMfaEnabled: false,
  mfaPending: false,
  role: "",
};

export const useAuthStore = create<AuthState>((set) => ({
  ...emptyAuthMetadata,
  isAuthenticated: false,

  setAuth: (metadata) =>
    set({
      ...metadata,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      ...emptyAuthMetadata,
      isAuthenticated: false,
    }),
}));
