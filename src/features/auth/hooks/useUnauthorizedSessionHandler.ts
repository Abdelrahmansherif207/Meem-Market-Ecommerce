"use client";

import { useEffect, useRef } from "react";
import { registerUnauthorizedHandler } from "@/shared/lib/unauthorizedEvent";
import { logoutAction } from "../actions/session";
import { useAuthStore } from "../store/useAuthStore";

export function useUnauthorizedSessionHandler() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      logoutAction().catch(() => {
        // Cookie clear is best-effort; local state is cleared regardless.
      });
      clearAuth();

      window.setTimeout(() => {
        handlingRef.current = false;
      }, 1_000);
    };

    return registerUnauthorizedHandler(handleUnauthorized);
  }, [clearAuth]);
}
