"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { cartService } from "../services/cartService";

/**
 * Watches for the guest → authenticated transition and bulk-syncs any local
 * guest cart items to the server cart. Should be mounted once near the top of
 * the tree (e.g. CartSyncProvider).
 *
 * Returns the current sync state so the host component can react without
 * reaching into the store itself.
 */
export function useSyncCartOnLogin() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuthRef = useRef<boolean>(isAuthenticated);
  const syncInFlightRef = useRef(false);

  const isSyncing = useGuestCartStore((s) => s.isSyncing);
  const syncError = useGuestCartStore((s) => s.syncError);

  useEffect(() => {
    const justLoggedIn = isAuthenticated && !prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!justLoggedIn) return;

    const { items, getSyncPayload, setSyncing, setSyncError, clearCart } =
      useGuestCartStore.getState();

    // No guest items — nothing to sync.
    if (items.length === 0) return;

    // Guard against double-firing in StrictMode / concurrent renders.
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;

    setSyncing(true);

    cartService
      .addBulkToCart(getSyncPayload(), locale)
      .then(() => {
        clearCart();
        // setSyncing(false) is handled by setSyncing's own logic;
        // we call it explicitly after clearing so the cart page knows to load.
        setSyncing(false);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to sync your cart. Please try again.";
        // setSyncError also sets isSyncing = false internally.
        setSyncError(message);
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });
  }, [isAuthenticated, locale]);

  return { isSyncing, syncError } as const;
}