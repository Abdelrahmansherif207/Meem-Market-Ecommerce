"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { exchangeSocialCodeAction } from "../actions/socialExchange";
import { clearAuthorizationCode } from "../services/socialService";

export function useSocialLoginCallback() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    handledRef.current = true;

    exchangeSocialCodeAction(code)
      .then((snapshot) => {
        if (!snapshot || !setSession(snapshot)) {
          throw new Error("Social login could not establish a valid session.");
        }
        clearAuthorizationCode(window.location.pathname);
      })
      .catch(() => {
        router.replace("/auth?error=social_login_failed");
      });
  }, [router, setSession]);
}
