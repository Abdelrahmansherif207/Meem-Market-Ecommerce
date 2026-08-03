"use client";

import { useAuthProfileSync } from "../hooks/useAuthProfileSync";
import { useSocialLoginCallback } from "../hooks/useSocialLoginCallback";

export function AuthSyncHandler() {
  useSocialLoginCallback();
  useAuthProfileSync();
  return null;
}
