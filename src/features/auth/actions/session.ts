"use server";

import { apiFetch } from "@/shared/lib/api";

import { clearSessionCookie, readSessionToken } from "../session/sessionCookies";
import type { SessionSnapshot } from "../types";

export async function getSessionAction(): Promise<SessionSnapshot | null> {
  const token = await readSessionToken();
  if (!token) return null;

  return { isAuthenticated: true };
}

export async function logoutAction(): Promise<boolean> {
  const token = await readSessionToken();

  clearSessionCookie();

  if (token) {
    try {
      await apiFetch("/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return false;
    }
  }

  return true;
}
