"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { cartService } from "@/features/cart/services/cartService";
import { guestCartService } from "../services/guestCartService";
import { guestSessionService } from "../services/guestSessionService";
import { useGuestSessionStore } from "../store/useGuestSessionStore";
import type { GuestCartItem } from "../types";

/**
 * Mounted once near the top of the tree (next to CartSyncProvider).
 *
 * 1. Session bootstrap — anonymous visitors get a guest session on first
 *    mount (idempotent POST; also restores CSRF after a page refresh).
 * 2. Merge-on-login — when the visitor signs in, the server guest cart is
 *    migrated into the authenticated cart, cleared, and the guest session is
 *    revoked (the default merge policy pending the final business decision).
 */
export function GuestSessionProvider() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuthRef = useRef(isAuthenticated);

  // Session bootstrap (anonymous only).
  useEffect(() => {
    if (!isGuestCheckoutEnabled()) return;
    if (isAuthenticated) return;
    useGuestSessionStore.getState().ensureSession(locale);
  }, [isAuthenticated, locale]);

  // Auth transition cleanup + guest-cart migration.
  useEffect(() => {
    const justLoggedIn = isAuthenticated && !prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (!justLoggedIn || !isGuestCheckoutEnabled()) return;

    let cancelled = false;
    (async () => {
      try {
        const cart = await guestCartService.getCart(locale);
        if (cancelled) return;
        const items: GuestCartItem[] = cart?.normal_items ?? [];
        if (items.length > 0) {
          // Bulk endpoint is scheduled-only; fast lines migrate as scheduled.
          await cartService.addBulkToCart(
            {
              items: items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                product_variant_id: item.product_variant_id ?? null,
                shipping_method: "scheduled" as const,
              })),
            },
            locale,
          );
          await guestCartService.clear(locale);
        }
      } catch {
        // Best-effort migration — the legacy localStorage sync remains the
        // fallback path for items that never reached the server cart.
      }
      try {
        await guestSessionService.revoke(locale);
      } catch {}
      if (!cancelled) useGuestSessionStore.getState().reset();
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, locale]);

  return null;
}
