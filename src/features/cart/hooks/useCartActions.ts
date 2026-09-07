"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useChannelStore } from "@/features/fast-shipping/store/useChannelStore";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { useServerCartStore } from "../store/useServerCartStore";
import { cartService } from "../services/cartService";
import type { CartLineIdentity, DeliveryType } from "../types";

/**
 * Unified cart-mutation hook.
 *
 * - **Guest:** reads/writes localStorage via `useGuestCartStore`.
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
  const channel = useChannelStore((s) => s.channel);
  // In fast-shipping mode, adds default to the fast cart — an explicit
  // per-call deliveryType always wins.
  const channelDeliveryType: DeliveryType =
    channel === "fast-shipping" ? "fast" : "scheduled";

  // ── Guest store (only used when not authenticated) ──────────────────────
  const guestAddItem = useGuestCartStore((s) => s.addItem);
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const guestQuantity = useGuestCartStore((s) => {
    const line: CartLineIdentity = { deliveryType: channel === "fast-shipping" ? "fast" : "scheduled" };
    return s.items
      .filter(
        (i) =>
          i.product_id === productId &&
          (i.deliveryType ?? "scheduled") === line.deliveryType,
      )
      .reduce((sum, i) => sum + i.quantity, 0);
  });

  // ── Server store — header badge counter ─────────────────────────────────
  const adjustQuantity = useServerCartStore((s) => s.adjustQuantity);

  // ── Optimistic quantity for authenticated users ──────────────────────────
  // Each ProductCard instance tracks its own in-session quantity so the UI
  // shows +/- controls and animates immediately without waiting for the API.
  // This resets to 0 when the component unmounts (navigation), which is fine —
  // the cart page is the authoritative view for server items.
  const [authQuantity, setAuthQuantity] = useState(0);
  const [isPending, setIsPending] = useState(false);

  // The quantity the card should display.
  const quantity = isAuthenticated
    ? authQuantity
    : guestQuantity;

  // ── addItem ──────────────────────────────────────────────────────────────
  const addItem = useCallback(
    async (item: {
      quantity: number;
      product_variant_id?: number | null;
      deliveryType?: DeliveryType;
      name: string;
      image: string;
      price: number;
      current_price: number;
      slug: string;
      sku: string;
      in_stock: boolean;
      stock_quantity: number;
    }) => {
      const deliveryType = item.deliveryType ?? channelDeliveryType;
      if (!isAuthenticated) {
        guestAddItem({
          product_id: productId,
          quantity: item.quantity,
          product_variant_id: item.product_variant_id ?? null,
          deliveryType,
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
      setAuthQuantity((q) => q + item.quantity);
      adjustQuantity(item.quantity);
      setIsPending(true);

      try {
        await cartService.addItem({
          product_id: productId,
          quantity: item.quantity,
          product_variant_id: item.product_variant_id ?? null,
          shipping_method: deliveryType,
        }, locale);
      } catch {
        // Rollback on failure.
        setAuthQuantity((q) => Math.max(0, q - item.quantity));
        adjustQuantity(-item.quantity);
      } finally {
        setIsPending(false);
      }
    },
    [isAuthenticated, productId, guestAddItem, adjustQuantity, locale, channelDeliveryType],
  );

  // ── increment ────────────────────────────────────────────────────────────
  // Operates on the channel-default line (explicit deliveryType override via addItem).
  const increment = useCallback(async () => {
    if (!isAuthenticated) {
      const target = useGuestCartStore
        .getState()
        .items.find(
          (i) =>
            i.product_id === productId &&
            (i.deliveryType ?? "scheduled") === channelDeliveryType,
        );
      // Stepper only renders when quantity > 0, so a line exists in practice.
      if (!target) return;
      guestUpdateQuantity(productId, target.quantity + 1, {
        deliveryType: channelDeliveryType,
        productVariantId: target.product_variant_id ?? null,
      });
      return;
    }

    setAuthQuantity((q) => q + 1);
    adjustQuantity(1);
    setIsPending(true);

    try {
      await cartService.addItem(
        { product_id: productId, quantity: 1, shipping_method: channelDeliveryType },
        locale,
      );
    } catch {
      setAuthQuantity((q) => Math.max(0, q - 1));
      adjustQuantity(-1);
    } finally {
      setIsPending(false);
    }
  }, [isAuthenticated, productId, guestUpdateQuantity, adjustQuantity, locale, channelDeliveryType]);

  // ── decrement ────────────────────────────────────────────────────────────
  const decrement = useCallback(
    async (cartItemId?: number) => {
      if (!isAuthenticated) {
        const target = useGuestCartStore
          .getState()
          .items.find(
            (i) =>
              i.product_id === productId &&
              (i.deliveryType ?? "scheduled") === channelDeliveryType,
          );
        if (!target) return;
        const line: CartLineIdentity = {
          deliveryType: channelDeliveryType,
          productVariantId: target.product_variant_id ?? null,
        };
        if (target.quantity <= 1) guestRemoveItem(productId, line);
        else guestUpdateQuantity(productId, target.quantity - 1, line);
        return;
      }

      const currentQty = authQuantity;
      const newQty = currentQty - 1;

      setAuthQuantity((q) => Math.max(0, q - 1));
      adjustQuantity(-1);

      if (newQty <= 0 || cartItemId === undefined) return;

      setIsPending(true);
      try {
        if (newQty === 0) {
          await cartService.removeItem(cartItemId, locale);
        } else {
          await cartService.updateItem({ item: { product_id: productId, quantity: currentQty, operation: "decrement", product_variant_id: undefined, shipping_method: channelDeliveryType } }, locale);
        }
      } catch {
        setAuthQuantity((q) => q + 1);
        adjustQuantity(1);
      } finally {
        setIsPending(false);
      }
    },
    [
      isAuthenticated,
      productId,
      authQuantity,
      locale,
      guestRemoveItem,
      guestUpdateQuantity,
      adjustQuantity,
      channelDeliveryType,
    ],
  );

  return useMemo(
    () => ({ quantity, isPending, addItem, increment, decrement }),
    [quantity, isPending, addItem, increment, decrement],
  );
}
