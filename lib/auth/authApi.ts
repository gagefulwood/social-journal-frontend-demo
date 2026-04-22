import axios from "axios";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_mfa_enabled: boolean;
  auth_provider: string;
};

export type LoginPayload = {
  identifier: string;
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
  access: string;
  refresh: string;
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const authApi = {
  
  async login(identifier: string, password: string): Promise<LoginResponse> {
    /**
    * 
    * POST /api/auth/token/
    * Accepts email or username as the identifier for login
    * Returns access and refresh JWT tokens
    */
    const res = await api.post<LoginResponse>("/auth/token/", {
      identifier,
      password,
    });
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    /**
     * POST /api/auth/register/
     * Creates a new user account.
     * Returns the created user's public fields.
     */
    const res = await api.post<User>("/auth/register/", payload);
    return res.data;
  },

  async verifyMFA(totp_code: string): Promise<void> {
    /**
     * POST /api/auth/mfa/verify/
     * Verifies a TOTP code against the user's stored mfa_secret.
     * Requires IsAuthenticated (call with a valid access token in header)
     */
    await api.post('/auth/mfa/verify/', { totp_code });
  },

  async logout(refresh: string): Promise<void> {
    /**
     * POST /api/auth/logout/
     * Blacklists the refresh token.
     * Requires the refresh token in the request body.
     */
    await api.post("/auth/logout/", { refresh });
  },

  async getProfile(): Promise<User> {
    /**
     * GET /api/users/me/
     * Returns the authenticated user's public profile fields.
     */
    const res = await api.get<User>("/users/me/");
    return res.data;
  },
};