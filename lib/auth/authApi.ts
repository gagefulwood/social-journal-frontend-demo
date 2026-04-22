import api from "@/lib/api/client";
import type {
  User,
  RegisterPayload,
  LoginResponse,
} from "@/types/auth";


export const authApi = {
  
  async login(identifier: string, password: string): Promise<LoginResponse> {
    /**
    * 
    * POST /api/auth/token/
    * Accepts email or username as the identifier for login
    * Returns access and refresh JWT tokens
    */
    const res = await api.post<LoginResponse>("/api/auth/token/", {
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
    const res = await api.post<User>("/api/auth/register/", payload);
    return res.data;
  },

  async verifyMFA(totp_code: string): Promise<void> {
    /**
     * POST /api/auth/mfa/verify/
     * Verifies a TOTP code against the user's stored mfa_secret.
     * Requires IsAuthenticated (call with a valid access token in header)
     */
    await api.post('/api/auth/mfa/verify/', { totp_code });
  },

  async logout(refresh: string): Promise<void> {
    /**
     * POST /api/auth/logout/
     * Blacklists the refresh token.
     * Requires the refresh token in the request body.
     */
    await api.post("/api/auth/logout/", { refresh });
  },

  async getProfile(): Promise<User> {
    /**
     * GET /api/users/me/
     * Returns the authenticated user's public profile fields.
     */
    const res = await api.get<User>("/api/users/me/");
    return res.data;
  },
};