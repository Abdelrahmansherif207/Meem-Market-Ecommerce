"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { registerUnauthorizedHandler } from "@/shared/lib/unauthorizedEvent";
import { useAuthStore } from "../store/useAuthStore";

export function useUnauthorizedSessionHandler() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      clearAuth();
      router.replace("/");

      window.setTimeout(() => {
        handlingRef.current = false;
      }, 1_000);
    };

    return registerUnauthorizedHandler(handleUnauthorized);
  }, [clearAuth, router]);
}
