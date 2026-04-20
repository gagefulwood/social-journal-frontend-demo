import axios from "axios";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type User = {
  id: number;
  username: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  phone_number?: string;
};

export type LoginResponse = {
  tokens: AuthTokens;
  user: User;
  mfaToken?: string;
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login/", {
      username,
      password,
    });
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<User>("/auth/register/", payload);
    return res.data;
  },

  async verifyMFA(code: string, mfa_token: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/mfa/verify/", {
      code,
      mfa_token,
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout/");
  },

  async getProfile(): Promise<User> {
    const res = await api.get<User>("/auth/profile/");
    return res.data;
  },
};