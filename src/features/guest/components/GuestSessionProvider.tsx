"use client";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { useGuestSessionStore } from "../store/useGuestSessionStore";

/**
 * Mounted once near the top of the tree (next to CartSyncProvider).
 *
 * Bootstraps the anonymous server guest session so the server-backed guest
 * cart can be created and read. The guest cart is merged into the
 * authenticated cart by the backend when the login tokens arrive — the client
 * must not upload or clear it manually.
 */
export function GuestSessionProvider() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Session bootstrap (anonymous only).
  useEffect(() => {
    if (!isGuestCheckoutEnabled()) return;
    if (isAuthenticated) return;
    useGuestSessionStore.getState().ensureSession(locale);
  }, [isAuthenticated, locale]);

  return null;
}
