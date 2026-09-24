"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Gate for private pages. Mount-time guards must not act on auth state before
 * it settles: the zustand store rehydrates asynchronously, so `isAuthenticated`
 * alone can briefly be false for a valid session. This hook waits until the
 * server has confirmed whether the httpOnly session cookie exists
 * (`sessionChecked`) before redirecting unauthenticated users.
 *
 * Returns the settled auth flags so callers can also wait on them for fetches.
 */
export function useRequireAuth(redirectPath: string = "/auth") {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  useEffect(() => {
    if (sessionChecked && !isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [sessionChecked, isAuthenticated, router, redirectPath]);

  return { isAuthenticated, sessionChecked } as const;
}
