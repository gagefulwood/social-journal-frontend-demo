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

  async verifyMFA(totp_code: string): Promise<{ access: string; refresh: string; detail: string}> {
    /**
     * POST /api/auth/mfa/verify/
     * Verifies a TOTP code against the user's stored mfa_secret.
     * Requires IsAuthenticated (call with a valid access token in header)
     */
    const res = await api.post('/api/auth/mfa/verify/', { totp_code });
    return res.data;
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
    const res = await api.get<User>("/api/auth/me/");
    return res.data;
  },

  async resetPassword(email: string): Promise<void> {
    /**
     * POST /api/auth/reset/
     * Sends a password reset email to the provided email address.
     */
    await api.post('/api/auth/reset/', { email });
  },
};
