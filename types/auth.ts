// types/auth.ts

export type User = {
  id: string;
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