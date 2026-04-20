import api from "@/lib/api/client";

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login/", { email, password });
    return res.data;
  },

  register: async (email: string, password: string) => {
    const res = await api.post("/auth/register/", { email, password });
    return res.data;
  },

  refresh: async (refresh: string) => {
    const res = await api.post("/auth/refresh/", { refresh });
    return res.data;
  },

  verifyMFA: async (code: string, mfa_token: string) => {
    const res = await api.post("/auth/mfa/verify/", {
      code,
      mfa_token,
    });
    return res.data;
  },

  logout: async (refresh: string) => {
    const res = await api.post("/auth/logout/", { refresh });
    return res.data;
  },
};