import api from "@/lib/api/client";
import type {
  AuthMetadata,
  AuthMetadataResponse,
  LoginPayload,
  MFASetupApiResponse,
  MFASetupResponse,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

function mapAuthMetadata(response: AuthMetadataResponse): AuthMetadata {
  return {
    userId: response.user_id,
    email: response.email,
    username: response.username,
    isMfaEnabled: response.is_mfa_enabled,
    mfaPending: response.mfa_pending,
    role: response.role,
  };
}

function mapMFASetupResponse(response: MFASetupApiResponse): MFASetupResponse {
  return {
    totpUri: response.otpauth_uri ?? response.totp_uri ?? response.qr_code_uri ?? "",
    manualKey: response.secret ?? response.manual_key ?? "",
  };
}

export const authApi = {
  async login(identifier: string, password: string): Promise<AuthMetadata> {
    const payload: LoginPayload = { identifier, password };
    const res = await api.post<AuthMetadataResponse>("/api/auth/token/", payload);
    return mapAuthMetadata(res.data);
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<User>("/api/auth/register/", payload);
    return res.data;
  },

  async verifyMFA(totpCode: string): Promise<AuthMetadata> {
    const res = await api.post<AuthMetadataResponse>("/api/auth/mfa/verify/", {
      totp_code: totpCode,
    });
    return mapAuthMetadata(res.data);
  },

  async setupMFA(): Promise<MFASetupResponse> {
    const res = await api.get<MFASetupApiResponse>("/api/auth/mfa/setup/");
    return mapMFASetupResponse(res.data);
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout/");
  },

  async getProfile(): Promise<User> {
    const res = await api.get<User>("/api/auth/me/");
    return res.data;
  },

  async patchProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.patch<User>("/api/auth/me/", payload);
    return res.data;
  },
};
