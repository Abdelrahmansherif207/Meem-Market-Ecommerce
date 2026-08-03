"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { clearAuthorizationCode, exchangeSocialCode } from "../services/socialService";

export function useSocialLoginCallback() {
  const router = useRouter();
  const setAuthData = useAuthStore((s) => s.setAuthData);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    handledRef.current = true;

    exchangeSocialCode(code)
      .then((response) => {
        if (!response.success || !response.token) {
          throw new Error(response.message || "Invalid or expired authorization code.");
        }

        setAuthData({
          token: response.token,
          ...(response.user as Record<string, unknown>),
          email_verified:
            response.user?.email_verified === true ||
            typeof response.user?.email_verified_at === "string",
        });
        clearAuthorizationCode(window.location.pathname);
      })
      .catch(() => {
        router.replace("/auth?error=social_login_failed");
      });
  }, [router, setAuthData]);
}
