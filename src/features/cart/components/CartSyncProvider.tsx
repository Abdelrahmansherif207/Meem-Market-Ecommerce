"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { guestCartService } from "@/features/guest/services/guestCartService";
import { runWithGuestSession } from "@/features/guest/utils/guestErrors";
import { useSyncCartOnLogin } from "../hooks/useSyncCartOnLogin";
import { useServerCartStore } from "../store/useServerCartStore";

export function CartSyncProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { isSyncing } = useSyncCartOnLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCartCount = useServerCartStore((s) => s.fetchCartCount);
  const setTotalQuantity = useServerCartStore((s) => s.setTotalQuantity);
  const guestServerMode = isGuestCheckoutEnabled();

  // Wait for the persisted auth snapshot before deciding which cart owns the
  // badge — otherwise a stale `isAuthenticated: false` fetches the guest cart.
  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setAuthHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect
    return unsub;
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isSyncing) {
      fetchCartCount(locale);
    }
  }, [isAuthenticated, isSyncing, fetchCartCount, locale]);

  // Anonymous shoppers with the flag ON use the server-backed guest cart —
  // hydrate the header badge from it (the localStorage store is empty).
  useEffect(() => {
    if (!authHydrated || isAuthenticated || !guestServerMode) return;
    let cancelled = false;

    runWithGuestSession(locale, () => guestCartService.getCart(locale))
      .then((cart) => {
        if (!cancelled) setTotalQuantity(cart?.total_quantity ?? 0);
      })
      .catch(() => {
        // Best-effort — the badge simply stays as-is.
      });

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, guestServerMode, locale, setTotalQuantity]);

  return <>{children}</>;
}
