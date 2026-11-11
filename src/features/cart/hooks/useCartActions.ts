"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { useServerCartStore } from "../store/useServerCartStore";
import { cartService } from "../services/cartService";
import { guestCartService } from "@/features/guest/services/guestCartService";
import { useGuestSessionStore } from "@/features/guest/store/useGuestSessionStore";
import { runWithGuestSession } from "@/features/guest/utils/guestErrors";

/**
 * Unified cart-mutation hook (single cart).
 *
 * - **Guest (legacy):** reads/writes localStorage via `useGuestCartStore`.
 * - **Guest (flag ON):** writes to the server-backed guest cart (`/general/guest/*`)
 *   with optimistic badge/quantity updates, mirroring the authenticated path.
 * - **Authenticated:** maintains optimistic per-card quantity state so the UI
 *   responds instantly, calls the server API in the background, and rolls back
 *   on failure. The header badge is kept in sync via `useServerCartStore`.
 *
 * `quantity` is always the value the ProductCard should display.
 * `isPending` is true while an API call is in-flight (disables controls).
 */
export function useCartActions(productId: number) {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestServerMode = !isAuthenticated && isGuestCheckoutEnabled();

  // ── Legacy guest store (flag OFF) ────────────────────────────────────────
  const guestAddItem = useGuestCartStore((s) => s.addItem);
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const guestQuantity = useGuestCartStore((s) => {
    return s.items
      .filter((i) => i.product_id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  });

  // ── Server store — header badge counter ─────────────────────────────────
  const adjustQuantity = useServerCartStore((s) => s.adjustQuantity);

  // ── Optimistic quantity (authenticated + guest-server) ───────────────────
  // Each ProductCard instance tracks its own in-session quantity so the UI
  // shows +/- controls and animates immediately without waiting for the API.
  // This resets to 0 when the component unmounts (navigation), which is fine —
  // the cart page is the authoritative view for server items.
  const [optimisticQuantity, setOptimisticQuantity] = useState(0);
  const [isPending, setIsPending] = useState(false);

  // The quantity the card should display.
  const quantity = isAuthenticated || guestServerMode
    ? optimisticQuantity
    : guestQuantity;

  const rollback = useCallback(
    (delta: number) => {
      setOptimisticQuantity((q) => Math.max(0, q - delta));
      adjustQuantity(-delta);
    },
    [adjustQuantity],
  );

  // ── addItem ──────────────────────────────────────────────────────────────
  const addItem = useCallback(
    async (item: {
      quantity: number;
      product_variant_id?: number | null;
      name: string;
      image: string;
      price: number;
      current_price: number;
      slug: string;
      sku: string;
      in_stock: boolean;
      stock_quantity: number;
    }) => {
      if (!isAuthenticated) {
        if (guestServerMode) {
          // Server-backed guest cart — optimistic like the auth path.
          setOptimisticQuantity((q) => q + item.quantity);
          adjustQuantity(item.quantity);
          setIsPending(true);
          try {
            await runWithGuestSession(locale, () =>
              guestCartService.addItem(
                {
                  product_id: productId,
                  quantity: item.quantity,
                  product_variant_id: item.product_variant_id ?? null,
                  shipping_method: "scheduled",
                },
                locale,
              ),
            );
          } catch {
            rollback(item.quantity);
          } finally {
            setIsPending(false);
          }
          return;
        }
        guestAddItem({
          product_id: productId,
          quantity: item.quantity,
          product_variant_id: item.product_variant_id ?? null,
          name: item.name,
          image: item.image,
          price: item.price,
          current_price: item.current_price,
          slug: item.slug,
          sku: item.sku,
          in_stock: item.in_stock,
          stock_quantity: item.stock_quantity,
        });
        return;
      }

      // Optimistically update UI and badge immediately.
      setOptimisticQuantity((q) => q + item.quantity);
      adjustQuantity(item.quantity);
      setIsPending(true);

      try {
        await cartService.addItem({
          product_id: productId,
          quantity: item.quantity,
          product_variant_id: item.product_variant_id ?? null,
          shipping_method: "scheduled",
        }, locale);
      } catch {
        // Rollback on failure.
        rollback(item.quantity);
      } finally {
        setIsPending(false);
      }
    },
    [isAuthenticated, guestServerMode, productId, guestAddItem, adjustQuantity, locale, rollback],
  );

  // ── increment ────────────────────────────────────────────────────────────
  const increment = useCallback(async () => {
    if (!isAuthenticated) {
      if (guestServerMode) {
        setOptimisticQuantity((q) => q + 1);
        adjustQuantity(1);
        setIsPending(true);
        try {
          await runWithGuestSession(locale, () =>
            guestCartService.addItem(
              { product_id: productId, quantity: 1, shipping_method: "scheduled" },
              locale,
            ),
          );
        } catch {
          rollback(1);
        } finally {
          setIsPending(false);
        }
        return;
      }
      const target = useGuestCartStore
        .getState()
        .items.find((i) => i.product_id === productId);
      // Stepper only renders when quantity > 0, so a line exists in practice.
      if (!target) return;
      guestUpdateQuantity(productId, target.quantity + 1, {
        productVariantId: target.product_variant_id ?? null,
      });
      return;
    }

    setOptimisticQuantity((q) => q + 1);
    adjustQuantity(1);
    setIsPending(true);

    try {
      await cartService.addItem(
        { product_id: productId, quantity: 1, shipping_method: "scheduled" },
        locale,
      );
    } catch {
      rollback(1);
    } finally {
      setIsPending(false);
    }
  }, [isAuthenticated, guestServerMode, productId, guestUpdateQuantity, adjustQuantity, locale, rollback]);

  // ── decrement ────────────────────────────────────────────────────────────
  const decrement = useCallback(
    async (cartItemId?: number) => {
      if (!isAuthenticated) {
        if (guestServerMode) {
          // Resolve the line from the server cart (cards don't carry line ids).
          setOptimisticQuantity((q) => Math.max(0, q - 1));
          adjustQuantity(-1);
          setIsPending(true);
          try {
            await runWithGuestSession(locale, async () => {
              const cart = await guestCartService.getCart(locale);
              const line =
                cart?.normal_items.find(
                  (i) =>
                    i.product_id === productId &&
                    i.shipping_method.toLowerCase() === "scheduled",
                ) ?? null;
              if (!line) return;
              if (line.quantity <= 1) {
                await guestCartService.removeLine(line.id, locale);
              } else {
                await guestCartService.updateItem(
                  {
                    item: {
                      product_id: productId,
                      quantity: line.quantity,
                      operation: "decrement",
                      product_variant_id: line.product_variant_id ?? undefined,
                      shipping_method: "scheduled",
                    },
                  },
                  locale,
                );
              }
            });
          } catch {
            rollback(-1);
          } finally {
            setIsPending(false);
          }
          return;
        }
        const target = useGuestCartStore
          .getState()
          .items.find((i) => i.product_id === productId);
        if (!target) return;
        const line = {
          productVariantId: target.product_variant_id ?? null,
        };
        if (target.quantity <= 1) guestRemoveItem(productId, line);
        else guestUpdateQuantity(productId, target.quantity - 1, line);
        return;
      }

      const currentQty = optimisticQuantity;
      const newQty = currentQty - 1;

      setOptimisticQuantity((q) => Math.max(0, q - 1));
      adjustQuantity(-1);

      if (newQty <= 0 || cartItemId === undefined) return;

      setIsPending(true);
      try {
        if (newQty === 0) {
          await cartService.removeItem(cartItemId, locale);
        } else {
          await cartService.updateItem({ item: { product_id: productId, quantity: currentQty, operation: "decrement", product_variant_id: undefined, shipping_method: "scheduled" } }, locale);
        }
      } catch {
        setOptimisticQuantity((q) => q + 1);
        adjustQuantity(1);
      } finally {
        setIsPending(false);
      }
    },
    [
      isAuthenticated,
      guestServerMode,
      productId,
      optimisticQuantity,
      locale,
      guestRemoveItem,
      guestUpdateQuantity,
      adjustQuantity,
    ],
  );

  return useMemo(
    () => ({ quantity, isPending, addItem, increment, decrement }),
    [quantity, isPending, addItem, increment, decrement],
  );
}
