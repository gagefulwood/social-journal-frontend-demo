export type AuthMetadata = {
  userId: string | number;
  email: string;
  username: string;
  isMfaEnabled: boolean;
  mfaPending: boolean;
  role: string;
};

export type AuthMetadataResponse = {
  user_id: string | number;
  email: string;
  username: string;
  is_mfa_enabled: boolean;
  mfa_pending: boolean;
  role: string;
};

export type User = {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_mfa_enabled: boolean;
  auth_provider?: string;
  role: string;
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

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type MFASetupResponse = {
  totpUri: string;
  manualKey: string;
};

export type MFASetupApiResponse = {
  otpauth_uri?: string;
  totp_uri?: string;
  qr_code_uri?: string;
  secret?: string;
  manual_key?: string;
};

export type UpdateProfilePayload = Partial<
  Pick<User, "username" | "email" | "first_name" | "last_name" | "phone_number">
>;

export type FieldErrors = Record<string, string[]>;

export type ApiError = {
  status: number | null;
  message: string;
  fieldErrors?: FieldErrors;
};

export type AuthState = AuthMetadata & {
  isAuthenticated: boolean;
  setAuth: (metadata: AuthMetadata) => void;
  clearAuth: () => void;
};
