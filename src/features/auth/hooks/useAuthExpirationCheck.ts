"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { AUTH_TOKEN_STORAGE_KEY } from "@/shared/constants/storageKeys";
import { useAuthStore } from "../store/useAuthStore";
import {
  getSessionInvalidationTime,
  MAX_TIMEOUT_MS,
} from "../utils/sessionExpiration";

export function useAuthExpirationCheck() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!token) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let invalidated = false;

    const invalidateSession = () => {
      if (invalidated) return;
      invalidated = true;
      clearAuth();
      router.replace("/");
    };

    const scheduleExpiration = () => {
      clearTimeout(timeoutId);
      const invalidationTime = getSessionInvalidationTime(expiresAt);

      if (invalidationTime === null || Date.now() >= invalidationTime) {
        invalidateSession();
        return;
      }

      timeoutId = setTimeout(
        scheduleExpiration,
        Math.min(invalidationTime - Date.now(), MAX_TIMEOUT_MS),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") scheduleExpiration();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_STORAGE_KEY && event.newValue === null) {
        invalidateSession();
      }
    };

    scheduleExpiration();
    window.addEventListener("focus", scheduleExpiration);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", scheduleExpiration);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, expiresAt, clearAuth, router]);
}
