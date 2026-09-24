import { apiFetch } from "@/shared/lib/api";

import type { SocialExchangeResponse } from "../types";

export interface SocialLoginStartResponse {
  success: boolean;
  url?: string;
  message?: string;
}

export async function loginWithGoogle(): Promise<string> {
  const data = await apiFetch<SocialLoginStartResponse>("/social/google", {
    channel: false,
  });

  if (!data.success || !data.url) {
    throw new Error(data.message || "Unable to start Google login.");
  }

  return data.url;
}

export async function exchangeSocialCode(code: string): Promise<SocialExchangeResponse> {
  return apiFetch<SocialExchangeResponse>("/social/exchange", {
    method: "POST",
    body: JSON.stringify({ code }),
    channel: false,
  });
}

export function clearAuthorizationCode(pathname: string): void {
  window.history.replaceState({}, "", pathname);
}
