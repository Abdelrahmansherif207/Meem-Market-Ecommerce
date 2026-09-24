import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  SESSION_HINT_COOKIE_NAME,
} from "@/shared/constants/sessionCookies";
import { parseSessionExpiry } from "../utils/sessionExpiration";

type SessionCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: "/";
};

function baseOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export async function setSessionCookie(
  token: string,
  expiresAt: string | null | undefined,
): Promise<void> {
  const store = await cookies();
  const expires = parseSessionExpiry(expiresAt);
  const expiryOptions = expires ? { expires: new Date(expires) } : {};

  store.set(SESSION_COOKIE_NAME, token, { ...baseOptions(), ...expiryOptions });
  store.set(SESSION_HINT_COOKIE_NAME, "1", {
    ...baseOptions(),
    httpOnly: false,
    ...expiryOptions,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  const expired = { ...baseOptions(), expires: new Date(0) };

  store.set(SESSION_COOKIE_NAME, "", expired);
  store.set(SESSION_HINT_COOKIE_NAME, "", { ...expired, httpOnly: false });
}

export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}
