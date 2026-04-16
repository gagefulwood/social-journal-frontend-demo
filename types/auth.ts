// types/auth.ts

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_mfa_enabled: boolean;
  auth_provider: string;
  role: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};