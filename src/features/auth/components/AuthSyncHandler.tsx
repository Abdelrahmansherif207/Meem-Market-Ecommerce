"use client";

import { useSocialLoginCallback } from "../hooks/useSocialLoginCallback";
import { useAuthExpirationCheck } from "../hooks/useAuthExpirationCheck";
import { useUnauthorizedSessionHandler } from "../hooks/useUnauthorizedSessionHandler";
import { useSessionHydration } from "../hooks/useSessionHydration";

export function AuthSyncHandler() {
  useSessionHydration();
  useSocialLoginCallback();
  useAuthExpirationCheck();
  useUnauthorizedSessionHandler();
  return null;
}
