export interface LoginPayload {
  email?: string;
  phone_number?: string;

  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
  avatar?: File | null;
  policy: boolean;
}

export interface LoginWithoutVerificationPayload {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface SendOtpCodePayload {
  email?: string;
  phone_number?: string;
}

export interface OtpLoginPayload {
  email?: string;
  phone_number?: string;
  otp_id?: string;
  code: string;
}

export type FieldErrors = Record<string, string>;

export interface ForgetPasswordPayload {
  email: string;
}

export interface VerifyPasswordPayload {
  email: string;
  token: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  newPassword_confirmation?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  newPassword_confirmation?: string;
}

export interface AuthLoginData {
  token: string;
  id?: number;
  permissions?: string[];
  email_verified?: boolean;
  role?: string[];
  email?: string;
  phone_number?: string;
}

export interface RegisterResponseData {
  message?: string;
  otp_status?: boolean;
  email?: string;
}

export interface SocialExchangeResponse {
  success: boolean;
  token?: string;
  token_type?: string;
  user?: Record<string, unknown>;
  message?: string;
}