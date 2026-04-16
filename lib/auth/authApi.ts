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
  username: string;
  email:string;
  password: string;
};

export type LoginResponse = {
  tokens: AuthTokens;
  user: User;
  mfaToken?: string;
};

export type MFAVerifyPayload = {
  code: string;
  mfaToken: string;
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<User>("/auth/register", payload);
    return res.data;
  },

  async verifyMFA(payload: MFAVerifyPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/mfa/verify", payload);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getProfile(): Promise<User> {
    const res = await api.get<User>("/auth/profile");
    return res.data;
  },
};