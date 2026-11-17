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
import type { GuestCart } from "../types";

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

    const readGuestCart = async (): Promise<
      GuestCart | null | "unavailable"
    > => {
      for (let attempt = 1; attempt <= MERGE_ATTEMPTS; attempt += 1) {
        try {
          return await guestCartService.getCart(locale);
        } catch (error) {
          // A missing/expired guest session means there is nothing to merge.
          if (error instanceof ApiError && error.status === 401) return null;
          if (attempt === MERGE_ATTEMPTS) return "unavailable";
          await delay(MERGE_RETRY_DELAY_MS * attempt);
        }
      }
      return "unavailable";
    };

    (async () => {
      const cart = await readGuestCart();
      if (cancelled) return;
      // Never revoke when the guest cart could not be read — that would
      // discard items without a successful merge.
      if (cart === "unavailable") {
        useServerCartStore.getState().fetchCartCount(locale);
        return;
      }

      let merged = true;

      if (cart && cart.items.length > 0) {
        try {
          // One bulk call keeps both delivery groups; `shipping_method` on
          // each line is what the backend uses to place it.
          await cartService.addBulkToCart(
            {
              items: cart.items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                product_variant_id: item.productVariantId,
                shipping_method: item.shippingMethod,
              })),
            },
            locale,
          );
        } catch {
          // Keep the guest session: a later login can retry the migration.
          merged = false;
        }

        if (merged) {
          try {
            await guestCartService.clear(locale);
          } catch {
            // Best-effort — revoking the session also drops the guest cart.
          }
        }
      }

      if (cancelled) return;

      if (merged) {
        try {
          await guestSessionService.revoke(locale);
        } catch {
          // Revoking is best-effort; local state is cleared regardless.
        }
        if (!cancelled) {
          useGuestSessionStore.getState().reset();
        }
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
