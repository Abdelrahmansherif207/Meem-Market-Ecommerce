"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";

/**
 * Fetches the guest-safe initial wishlist state for a product
 * (`GET /api/v1/wishlists/in_wishlist/{product_id}`) and seeds the store.
 * Returns `true` once the fetch has settled so callers can render the heart
 * without flashing. Never throws — guests simply fall back to `false`.
 */
export function useWishlistInitialState(productId: number, enabled = true) {
  const locale = useLocale();
  const [loaded, setLoaded] = useState(() => !enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    wishlistService
      .getInWishlist(productId, locale)
      .then((inWishlist) => {
        if (!active) return;
        useWishlistStore.getState().seed(productId, inWishlist);
      })
      .catch(() => {
        // Public endpoint — treat any failure as "not in wishlist".
        if (!active) return;
        useWishlistStore.getState().seed(productId, false);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [productId, locale, enabled]);

  return loaded;
}
