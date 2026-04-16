"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function setAuth(
  accessToken: string,
  refreshToken?: string,
  user?: User,
  mfaToken?: string
) {
  useAuthStore.getState().login(
    accessToken,
    refreshToken,
    user,
    mfaToken
  );

  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken);
  }
}

export function clearAuth() {
  useAuthStore.getState().logout();
  Cookies.remove("refreshToken");
}

export async function tokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) return null;

    const res = await axios.post(`${API_URL}/auth/refresh`, {
      refresh: refreshToken,
    });

    const { access, user } = res.data;

    if (!access) return null;

    setAuth(access, refreshToken, user);
    return access;
  } catch {
    clearAuth();
    return null;
  }
}