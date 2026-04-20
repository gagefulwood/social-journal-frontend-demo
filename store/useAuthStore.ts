import { create } from "zustand";
import type { User } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  mfaToken: string | null;
  isAuthenticated: boolean;

  login: (
    accessToken: string,
    refreshToken?: string,
    user?: User,
    mfaToken?: string
  ) => void;

  logout: () => void;
  setMfaToken: (token: string | null) => void;
};

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