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

  Cookies.set("accessToken", accessToken, {
    expires: 1/24,        // 1 hour — js-cookie uses days, so 1/24 = 1 hour
    sameSite: "lax",      // strict blocks cookies on redirect
    path: "/",
  });

  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken, {
      expires: 7,         // 7 days
      sameSite: "lax",
      path: "/",
    });
  }

  login(accessToken, refreshToken, user);
}

export function clearAuth() {
  const { logout } = useAuthStore.getState();

  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  logout();
}

export async function tokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) return null;

    const res = await axios.post(
      `${API_URL}/api/auth/token/refresh/`,
      { refresh: refreshToken },
    );

    const newAccessToken = res.data.access;
    if (!newAccessToken) return null;

    Cookies.set("accessToken", newAccessToken, {
      expires: 1/24,
      sameSite: "lax",
      path: "/",
    });

    return newAccessToken;
  } catch {
    clearAuth();
    return null;
  }
}