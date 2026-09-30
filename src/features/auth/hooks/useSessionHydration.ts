"use client";

import { useEffect } from "react";
import { getSessionAction } from "../actions/session";
import { useAuthStore } from "../store/useAuthStore";

export function useSessionHydration() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);

  useEffect(() => {
    let cancelled = false;

    getSessionAction()
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot) {
          clearAuth();
        }
        setSessionChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep current metadata if the check fails; the profile sync and
        // API-layer 401 handling will reconcile the real state.
        setSessionChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuth, setSessionChecked]);
}
