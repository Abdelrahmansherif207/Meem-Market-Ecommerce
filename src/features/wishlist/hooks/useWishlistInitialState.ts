"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";

/**
 * Fetches the initial wishlist state for a product
 * (`GET /api/v1/wishlists/in_wishlist/{product_id}`) and seeds the store.
 *
 * The endpoint is authenticated-only, so guests must never trigger it — doing
 * so produced a 401 on every product view. The request runs once the shopper
 * is signed in and again after re-authentication. Returns `true` once no
 * request is pending so callers can render the heart without flashing.
 */
export function useWishlistInitialState(productId: number, enabled = true) {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const shouldFetch = enabled && isAuthenticated;
  const requestKey = `${productId}:${locale}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const loaded = !shouldFetch || settledKey === requestKey;

  useEffect(() => {
    if (!shouldFetch) return;
    let active = true;
    wishlistService
      .getInWishlist(productId, locale)
      .then((inWishlist) => {
        if (!active) return;
        useWishlistStore.getState().seed(productId, inWishlist);
      })
      .catch(() => {
        // Best effort — treat any failure as "not in wishlist".
        if (!active) return;
        useWishlistStore.getState().seed(productId, false);
      })
      .finally(() => {
        if (active) setSettledKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [shouldFetch, productId, locale, requestKey]);

  return loaded;
}
