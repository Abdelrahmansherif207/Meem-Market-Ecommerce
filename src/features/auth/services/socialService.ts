import type { SocialExchangeResponse } from "../types";

export interface SocialLoginStartResponse {
  success: boolean;
  url?: string;
  message?: string;
}

function getSocialBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.");
  }
  return baseUrl;
}

export async function loginWithGoogle(): Promise<string> {
  const response = await fetch(`${getSocialBaseUrl()}/social/google`);
  const data = (await response.json()) as SocialLoginStartResponse;

  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.message || "Unable to start Google login.");
  }

  return data.url;
}

export async function exchangeSocialCode(code: string): Promise<SocialExchangeResponse> {
  const response = await fetch(`${getSocialBaseUrl()}/social/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = (await response.json()) as SocialExchangeResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Invalid or expired authorization code.");
  }

  return data;
}

export function clearAuthorizationCode(pathname: string): void {
  window.history.replaceState({}, "", pathname);
}
