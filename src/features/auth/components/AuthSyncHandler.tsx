"use client";

import { useAuthProfileSync } from "../hooks/useAuthProfileSync";
import { useSocialLoginCallback } from "../hooks/useSocialLoginCallback";
import { useAuthExpirationCheck } from "../hooks/useAuthExpirationCheck";
import { useUnauthorizedSessionHandler } from "../hooks/useUnauthorizedSessionHandler";

export function AuthSyncHandler() {
  useSocialLoginCallback();
  useAuthProfileSync();
  useAuthExpirationCheck();
  useUnauthorizedSessionHandler();
  return null;
}
