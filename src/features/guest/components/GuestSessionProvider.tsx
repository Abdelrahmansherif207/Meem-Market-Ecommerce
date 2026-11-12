"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { useServerCartStore } from "@/features/cart";
import { cartService } from "@/features/cart/services/cartService";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { ApiError } from "@/shared/lib/api";
import { guestCartService } from "../services/guestCartService";
import { guestSessionService } from "../services/guestSessionService";
import { useGuestSessionStore } from "../store/useGuestSessionStore";
import type { GuestCartItem } from "../types";

const MERGE_ATTEMPTS = 3;
const MERGE_RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mounted once near the top of the tree (next to CartSyncProvider).
 *
 * 1. Session bootstrap — anonymous visitors get a guest session on first
 *    mount (idempotent POST; also restores CSRF after a page refresh).
 * 2. Merge-on-login — when the visitor signs in, the server guest cart is
 *    migrated into the authenticated cart, cleared, and only then is the
 *    guest session revoked. A failed merge keeps the guest session so the
 *    items can be recovered on a later attempt.
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

    const mergeGuestCart = async (): Promise<GuestCartItem[] | null> => {
      for (let attempt = 1; attempt <= MERGE_ATTEMPTS; attempt += 1) {
        try {
          const cart = await guestCartService.getCart(locale);
          if (cancelled) return null;
          return cart?.normal_items ?? [];
        } catch (error) {
          // A missing/expired guest session means there is nothing to merge.
          if (error instanceof ApiError && error.status === 401) return [];
          if (attempt === MERGE_ATTEMPTS) return null;
          await delay(MERGE_RETRY_DELAY_MS * attempt);
        }
      }
      return null;
    };

    (async () => {
      const items = await mergeGuestCart();
      if (cancelled) return;

      let merged = items !== null;
      if (items && items.length > 0) {
        try {
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
        } catch {
          // Keep the guest session: the next attempt can retry the migration.
          merged = false;
        }

        // The items are now in the authenticated cart. Clearing is
        // best-effort — revoking the session also drops the guest cart.
        if (merged) {
          try {
            await guestCartService.clear(locale);
          } catch {
            // Ignored — see above.
          }
        }
      }

      if (cancelled) return;

      if (merged) {
        try {
          await guestSessionService.revoke(locale);
        } catch {
          // Revoking is best-effort; the local session is cleared regardless.
        }
        if (!cancelled) useGuestSessionStore.getState().reset();
      }

      // The authenticated badge may have been fetched before the merge
      // finished — refresh it from the authoritative cart.
      useServerCartStore.getState().fetchCartCount(locale);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, locale]);

  return null;
}
