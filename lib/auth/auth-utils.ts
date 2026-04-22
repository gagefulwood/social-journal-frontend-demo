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
) {
  const { login } = useAuthStore.getState();

  // Store tokens in cookies
  Cookies.set("accessToken", accessToken, {
    sameSite: "strict",
    maxAge: 3600, // 1 hour
  });

  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken, {
      sameSite: "strict",
      maxAge: 3600 * 168 // 7 days
    });
  }

  login(accessToken, refreshToken, user);
}

export function clearAuth() {
  const { logout } = useAuthStore.getState();

  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  logout();
}

export async function tokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) return null;

    const res = await axios.post(
      `${API_URL}/api/auth/token/refresh`,
      { refresh: refreshToken },
    );

    const newAccessToken = res.data.access;
    if (!newAccessToken) return null;

    Cookies.set("accessToken", newAccessToken, {
      sameSite: "strict",
      maxAge: 3600, // 1 hour
    });

    return newAccessToken;
  } catch {
    clearAuth();
    return null;
  }
}