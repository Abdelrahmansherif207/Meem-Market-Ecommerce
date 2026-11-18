"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { guestCartService } from "@/features/guest/services/guestCartService";
import { useGuestSessionStore } from "@/features/guest/store/useGuestSessionStore";
import { runWithGuestSession } from "@/features/guest/utils/guestErrors";
import { useServerCartStore } from "../store/useServerCartStore";
import { useGuestCartStore } from "../store/useGuestCartStore";

/** One-time migration marker for the legacy localStorage guest cart. */
const MIGRATION_FLAG = "guest-cart-server-migrated";

export function CartSyncProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
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
    if (isAuthenticated) {
      fetchCartCount(locale);
    }
  }, [isAuthenticated, fetchCartCount, locale]);

  // Anonymous shoppers with the flag ON use the server-backed guest cart —
  // hydrate the header badge from it (the localStorage store is empty).
  useEffect(() => {
    if (!authHydrated || isAuthenticated || !guestServerMode) return;
    let cancelled = false;

    runWithGuestSession(locale, () => guestCartService.getCart(locale))
      .then((cart) => {
        if (!cancelled) setTotalQuantity(cart?.totalQuantity ?? 0);
      })
      .catch(() => {
        // Best-effort — the badge simply stays as-is.
      });

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, guestServerMode, locale, setTotalQuantity]);

  /**
   * One-time migration: when the guest server cart is enabled, upload any
   * legacy localStorage lines and remove each one only after it landed, so a
   * partial failure can resume without duplicating items.
   */
  useEffect(() => {
    if (!authHydrated || isAuthenticated || !guestServerMode) return;

    const legacyItems = useGuestCartStore.getState().items;
    if (legacyItems.length === 0) return;
    try {
      if (window.sessionStorage.getItem(MIGRATION_FLAG) === "1") return;
    } catch {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await useGuestSessionStore.getState().ensureSession(locale);

        for (const item of legacyItems) {
          if (cancelled) return;
          await runWithGuestSession(locale, () =>
            guestCartService.addItem(
              {
                product_id: item.product_id,
                quantity: item.quantity,
                product_variant_id: item.product_variant_id ?? null,
                shipping_method: item.deliveryType ?? "scheduled",
              },
              locale,
            ),
          );
          useGuestCartStore.getState().removeItem(item.product_id, {
            productVariantId: item.product_variant_id ?? null,
            deliveryType: item.deliveryType ?? "scheduled",
          });
        }

        try {
          window.sessionStorage.setItem(MIGRATION_FLAG, "1");
        } catch {}
      } catch (error) {
        console.warn("[cart] legacy guest cart migration failed", error);
      } finally {
        if (!cancelled) {
          const cart = await guestCartService.getCart(locale).catch(() => null);
          setTotalQuantity(cart?.totalQuantity ?? 0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, guestServerMode, locale, setTotalQuantity]);

  return <>{children}</>;
}
