"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";
import { useWishlistInitialState } from "./useWishlistInitialState";

type WishlistActionResult = "ok" | "duplicate" | "not-found" | "auth-required" | "error";

interface UseWishlistActionsOptions {
  /** Variant id to attach to add/remove calls (required for variant items). */
  variantId?: number | null;
  /** Initial heart state from the product payload (`in_wishlist` field). */
  initialInWishlist?: boolean;
  /** Fetch the guest-safe initial state from the API (used on the detail page). */
  fetchInitial?: boolean;
}

/**
 * Unified wishlist-mutation hook used by the card heart and the detail page
 * button.
 *
 * - **Guests:** tapping opens the auth modal and records the intended action so
 *   it resumes after login. The heart always stays empty for guests.
 * - **Authenticated:** optimistically updates the store, calls the API, and
 *   rolls back on failure.
 * - **401 mid-session:** reverts the optimistic change, clears the stored
 *   token, opens the auth modal, and preserves the intended action.
 */
export function useWishlistActions(
  productId: number,
  options?: UseWishlistActionsOptions,
) {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const entry = useWishlistStore((s) => s.entries[productId]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variantId = options?.variantId ?? null;
  const initialInWishlist = options?.initialInWishlist;
  const fetchInitial = options?.fetchInitial ?? false;

  const initialLoaded = useWishlistInitialState(productId, fetchInitial);

  // Seed the store from the payload when provided and no state is tracked yet.
  useEffect(() => {
    if (initialInWishlist !== undefined) {
      useWishlistStore.getState().seed(productId, initialInWishlist);
    }
  }, [productId, initialInWishlist]);

  const inWishlist = entry ?? (fetchInitial ? false : (initialInWishlist ?? false));

  const setPending = useCallback((intent: "toggle" | "add" | "remove") => {
    useWishlistStore.getState().setPendingAction({
      productId,
      variantId,
      intent,
    });
  }, [productId, variantId]);

  const openAuth = useCallback(() => {
    useAuthModalStore.getState().open();
  }, []);

  /** Returns true when the user may proceed; otherwise handles auth and records the action. */
  const requireAuth = useCallback((intent: "toggle" | "add" | "remove") => {
    if (isAuthenticated) return true;
    setPending(intent);
    openAuth();
    return false;
  }, [isAuthenticated, setPending, openAuth]);

  const handleUnauthorized = useCallback(
    (intent: "toggle" | "add" | "remove") => {
      useAuthStore.getState().clearAuth();
      setPending(intent);
      openAuth();
    },
    [setPending, openAuth],
  );

  const toggle = useCallback(async (): Promise<WishlistActionResult> => {
    if (!requireAuth("toggle")) return "auth-required";

    const current = useWishlistStore.getState().entries[productId] ?? initialInWishlist ?? false;
    const next = !current;

    setError(null);
    setIsPending(true);
    // Optimistic update.
    useWishlistStore.getState().setEntry(productId, next);
    useWishlistStore.getState().adjustCount(next ? 1 : -1);

    try {
      await wishlistService.toggle(productId, locale);
      // A successful toggle always flips the state — keep the optimistic value
      // (the API response carries no `data.in_wishlist` to confirm it).
      useWishlistStore.getState().setEntry(productId, next);
      return "ok";
    } catch (err) {
      if (wishlistService.isUnauthorizedError(err)) {
        // Revert the optimistic change before handing off to login.
        useWishlistStore.getState().setEntry(productId, current);
        useWishlistStore.getState().adjustCount(current ? 1 : -1);
        handleUnauthorized("toggle");
        return "auth-required";
      }
      // Rollback on failure.
      useWishlistStore.getState().setEntry(productId, current);
      useWishlistStore.getState().adjustCount(current ? 1 : -1);
      setError(err instanceof Error ? err.message : "Wishlist request failed.");
      return "error";
    } finally {
      setIsPending(false);
    }
  }, [productId, locale, initialInWishlist, requireAuth, handleUnauthorized]);

  const add = useCallback(async (): Promise<WishlistActionResult> => {
    if (!requireAuth("add")) return "auth-required";

    const current = useWishlistStore.getState().entries[productId] ?? initialInWishlist ?? false;

    setError(null);
    setIsPending(true);
    // Optimistic update — fill the heart immediately.
    useWishlistStore.getState().setEntry(productId, true);
    useWishlistStore.getState().adjustCount(1);

    try {
      await wishlistService.add(productId, variantId, locale);
      return "ok";
    } catch (err) {
      if (wishlistService.isUnauthorizedError(err)) {
        // Revert the optimistic change before handing off to login.
        useWishlistStore.getState().setEntry(productId, current);
        useWishlistStore.getState().adjustCount(-1);
        handleUnauthorized("add");
        return "auth-required";
      }
      if (wishlistService.isDuplicateError(err)) {
        // Duplicate — keep the heart filled (already optimistically filled).
        return "duplicate";
      }
      // Rollback on failure.
      useWishlistStore.getState().setEntry(productId, current);
      useWishlistStore.getState().adjustCount(-1);
      setError(err instanceof Error ? err.message : "Could not add to wishlist.");
      return "error";
    } finally {
      setIsPending(false);
    }
  }, [productId, locale, variantId, initialInWishlist, requireAuth, handleUnauthorized]);

  const remove = useCallback(async (): Promise<WishlistActionResult> => {
    if (!requireAuth("remove")) return "auth-required";

    setError(null);
    setIsPending(true);

    try {
      await wishlistService.remove(productId, variantId, locale);
      useWishlistStore.getState().setEntry(productId, false);
      useWishlistStore.getState().adjustCount(-1);
      return "ok";
    } catch (err) {
      if (wishlistService.isUnauthorizedError(err)) {
        handleUnauthorized("remove");
        return "auth-required";
      }
      if (wishlistService.isNotFoundError(err)) {
        // Item no longer present — reflect that in state.
        useWishlistStore.getState().setEntry(productId, false);
        return "not-found";
      }
      setError(err instanceof Error ? err.message : "Could not remove from wishlist.");
      return "error";
    } finally {
      setIsPending(false);
    }
  }, [productId, locale, variantId, requireAuth, handleUnauthorized]);

  return {
    inWishlist,
    isPending,
    error,
    setError,
    initialLoaded,
    toggle,
    add,
    remove,
  };
}
