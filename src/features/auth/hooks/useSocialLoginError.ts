"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const SOCIAL_LOGIN_FAILED_ERROR = "social_login_failed";
const SOCIAL_LOGIN_ERROR_MESSAGE = "Google login failed. Please try again.";

export function useSocialLoginError(): string | null {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") !== SOCIAL_LOGIN_FAILED_ERROR) return;

    const params = new URLSearchParams(window.location.search);
    params.delete("error");
    const nextSearch = params.toString();
    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [searchParams]);

  if (searchParams.get("error") !== SOCIAL_LOGIN_FAILED_ERROR) return null;
  return SOCIAL_LOGIN_ERROR_MESSAGE;
}
