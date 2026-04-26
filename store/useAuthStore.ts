import { create } from "zustand";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  mfaToken: null,
  isAuthenticated: false,

  login: (accessToken, refreshToken, user, mfaToken) =>
    set({
      accessToken,
      refreshToken: refreshToken ?? null,
      user: user ?? null,
      mfaToken: mfaToken ?? null,
      isAuthenticated: !!accessToken,
    }),

  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      mfaToken: null,
      isAuthenticated: false,
    }),

  setMfaToken: (token) =>
    set({
      mfaToken: token,
    }),
}));