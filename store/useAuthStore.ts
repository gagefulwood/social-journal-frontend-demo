import { create } from "zustand";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaPending: boolean;
  mfaToken: string | null;

  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
    mfaToken?: string
  ) => void;

  logout: () => void;

  setUser: (user: User) => void;
  setMfaPending: (pending: boolean) => void;
  setMfaToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  mfaPending: false,
  mfaToken: null,

  login: (accessToken, refreshToken, user, mfaToken) => {
    // store tokens in cookies/localStorage if needed
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    set({
      user,
      isAuthenticated: true,
      mfaPending: !!mfaToken,
      mfaToken: mfaToken ?? null,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    set({
      user: null,
      isAuthenticated: false,
      mfaPending: false,
      mfaToken: null,
    });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
  setMfaPending: (pending) => set({ mfaPending: pending }),
  setMfaToken: (token) => set({ mfaToken: token }),
}));