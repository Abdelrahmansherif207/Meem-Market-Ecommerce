"use server";

import { exchangeSocialCode } from "../services/socialService";
import { isSessionActive } from "../utils/sessionExpiration";
import { setSessionCookie } from "../session/sessionCookies";
import type { SessionSnapshot } from "../types";

export async function exchangeSocialCodeAction(
  code: string,
): Promise<SessionSnapshot | null> {
  try {
    const response = await exchangeSocialCode(code);
    if (!response.token) return null;

    const user = response.user;
    const userExpiry = user?.expires_at;
    const expiresAt =
      response.expires_at ??
      (typeof userExpiry === "string" ? userExpiry : undefined);

    if (!isSessionActive(expiresAt)) {
      return null;
    }

    await setSessionCookie(response.token, expiresAt);

    return {
      isAuthenticated: true,
      id: user?.id,
      permissions: [],
      role: [],
      email_verified:
        user?.email_verified === true ||
        typeof user?.email_verified_at === "string",
      email: user?.email,
      phone_number: user?.phone_number,
      expires_at: expiresAt,
    };
  } catch {
    return null;
  }
}
