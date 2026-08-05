"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";
import { useResumePendingWishlistAction } from "../hooks/useResumePendingWishlistAction";

/**
 * Keeps the header wishlist badge count in sync and resumes any wishlist action
 * a guest started before signing in. Mount once near the top of the tree
 * (alongside CartSyncProvider in the root layout).
 */
export function WishlistSyncProvider() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useResumePendingWishlistAction();

  useEffect(() => {
    if (!isAuthenticated) {
      useWishlistStore.getState().reset();
      return;
    }
    wishlistService
      .getWishlists(locale, 1)
      .then((res) => {
        const store = useWishlistStore.getState();
        store.setCount(res.meta?.total ?? res.data.length);
        // Seed entries so already-wishlisted products render with a red heart.
        for (const item of res.data) {
          store.seed(item.product_id, true);
        }
      })
      .catch(() => {
        // Best-effort — the badge is not critical.
      });
  }, [isAuthenticated, locale]);

  return null;
}
