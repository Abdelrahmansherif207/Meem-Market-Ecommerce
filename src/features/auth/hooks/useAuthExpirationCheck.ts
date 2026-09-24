"use client";

import { useEffect } from "react";
import { AUTH_STORE_STORAGE_KEY } from "../store/authStoreKeys";
import { useAuthStore } from "../store/useAuthStore";
import {
  getSessionInvalidationTime,
  isSessionActive,
  MAX_TIMEOUT_MS,
} from "../utils/sessionExpiration";

export function useAuthExpirationCheck() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let invalidated = false;

    const invalidateSession = () => {
      if (invalidated) return;
      invalidated = true;
      clearAuth();
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
      if (event.key !== AUTH_STORE_STORAGE_KEY) return;

      if (!event.newValue) {
        invalidateSession();
        return;
      }

      try {
        const persisted = JSON.parse(event.newValue) as {
          state?: { isAuthenticated?: boolean; expiresAt?: string | null };
        };
        const state = persisted.state;
        if (!state?.isAuthenticated || !isSessionActive(state.expiresAt)) {
          invalidateSession();
        }
      } catch {
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
  }, [isAuthenticated, expiresAt, clearAuth]);
}
