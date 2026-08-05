"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";

/**
 * Watches the guest → authenticated transition and resumes the wishlist action
 * a guest wanted to run before being asked to sign in. Mount it once near the
 * top of the tree (e.g. alongside CartSyncProvider in the root layout).
 */
export function useResumePendingWishlistAction() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuthRef = useRef<boolean>(isAuthenticated);

  useEffect(() => {
    const justLoggedIn = isAuthenticated && !prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!justLoggedIn) return;

    const pending = useWishlistStore.getState().pendingAction;
    if (!pending) return;
    useWishlistStore.getState().clearPendingAction();

    const store = useWishlistStore.getState();
    const variantId = pending.variantId ?? null;
    const currentInWishlist = store.entries[pending.productId] ?? false;

    const run = async () => {
      try {
        if (pending.intent === "add") {
          await wishlistService.add(pending.productId, variantId, locale);
          useWishlistStore.getState().setEntry(pending.productId, true);
        } else if (pending.intent === "remove") {
          await wishlistService.remove(pending.productId, variantId, locale);
          useWishlistStore.getState().setEntry(pending.productId, false);
        } else {
          // toggle — flip based on the current tracked state.
          if (currentInWishlist) {
            await wishlistService.remove(pending.productId, variantId, locale);
            useWishlistStore.getState().setEntry(pending.productId, false);
          } else {
            await wishlistService.add(pending.productId, variantId, locale);
            useWishlistStore.getState().setEntry(pending.productId, true);
          }
        }
      } catch {
        // Best-effort — the wishlist page remains the source of truth.
      }
    };
    run();
  }, [isAuthenticated, locale]);
}
