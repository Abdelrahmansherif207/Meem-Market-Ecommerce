"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError } from "@/shared/lib/api";
import { useAuthStore } from "@/features/auth";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { useChannelStore } from "@/features/fast-shipping/store/useChannelStore";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { useServerCartStore } from "../store/useServerCartStore";
import { useCartFeedbackStore } from "../store/useCartFeedbackStore";
import { cartService } from "../services/cartService";
import { guestCartService } from "@/features/guest/services/guestCartService";
import { runWithGuestSession } from "@/features/guest/utils/guestErrors";
import { buildGA4Item, trackAddToCart, trackRemoveFromCart } from "@/features/analytics";
import { useDisplayCurrency } from "@/features/currencies";
import type { GuestCart, GuestCartLine } from "@/features/guest/types";
import type { CartLineIdentity, DeliveryType } from "../types";

type CartApiLine = {
  id: number;
  product_id: number;
  quantity: number;
  product_variant_id?: number | null;
  shipping_method?: string | null;
};

/** Resolve the requested line in the matching delivery group (auth cart). */
function findCartLine(
  cart: { normal_items?: CartApiLine[]; fast_items?: CartApiLine[] } | null,
  productId: number,
  deliveryType: DeliveryType,
): CartApiLine | null {
  const group = deliveryType === "fast" ? cart?.fast_items : cart?.normal_items;
  return group?.find((item) => item.product_id === productId) ?? null;
}

/** Resolve the requested line in the flat guest cart. */
function findGuestCartLine(
  cart: GuestCart | null,
  productId: number,
  deliveryType: DeliveryType,
): GuestCartLine | null {
  return (
    cart?.items.find(
      (item) =>
        item.productId === productId &&
        item.shippingMethod === deliveryType,
    ) ?? null
  );
}

/**
 * Product descriptor for analytics (name/price/variant as shown in the UI).
 * Optional — without it, quantity events still fire with item_id only.
 */
export interface CartActionProductDescriptor {
  name: string;
  price: number;
  originalPrice?: number | null;
  sku?: string | null;
  variantId?: number | null;
}

/**
 * Unified cart-mutation hook (mixed scheduled + fast cart).
 *
 * - **Guest (legacy):** reads/writes localStorage via `useGuestCartStore`.
 * - **Guest (flag ON):** writes to the server-backed guest cart
 *   (`/general/guest/*`) and sends the matching `X-Channel` for fast lines.
 * - **Authenticated:** maintains optimistic per-card quantity state, calls
 *   the server API with the explicit delivery group + `X-Channel`, and rolls
 *   back on failure. The header badge is kept in sync via `useServerCartStore`.
 *
 * The browsing channel only sets the *default* delivery type for card
 * actions; an explicit `deliveryType` on `addItem` always wins.
 */
export function useCartActions(
  productId: number,
  product?: CartActionProductDescriptor,
) {
  const locale = useLocale();
  const tFeedback = useTranslations("cartPage.feedback");
  const { code: currencyCode } = useDisplayCurrency();
  const showFeedback = useCartFeedbackStore((s) => s.showFeedback);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestServerMode = !isAuthenticated && isGuestCheckoutEnabled();
  const channel = useChannelStore((s) => s.channel);
  // Both guests and signed-in shoppers follow the selected channel.
  const channelDeliveryType: DeliveryType =
    channel === "fast-shipping" ? "fast" : "scheduled";

  // ── Legacy guest store (flag OFF) ────────────────────────────────────────
  const guestAddItem = useGuestCartStore((s) => s.addItem);
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const guestQuantity = useGuestCartStore((s) => {
    return s.items
      .filter(
        (i) =>
          i.product_id === productId &&
          (i.deliveryType ?? "scheduled") === channelDeliveryType,
      )
      .reduce((sum, i) => sum + i.quantity, 0);
  });

  // ── Server store — header badge counter ─────────────────────────────────
  const adjustQuantity = useServerCartStore((s) => s.adjustQuantity);
  const setTotalQuantity = useServerCartStore((s) => s.setTotalQuantity);

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

  /**
   * Surface cart failures instead of swallowing them. The API error message is
   * preferred for validation failures (e.g. stock), while transport/session
   * errors get a localized, actionable message.
   */
  const reportError = useCallback(
    (error: unknown, action: "add" | "update") => {
      const title =
        action === "add" ? tFeedback("addTitle") : tFeedback("updateTitle");

      let message = tFeedback("generic");
      if (error instanceof ApiError) {
        if (error.status === 429) message = tFeedback("rateLimited");
        else if (error.status === 401 || error.status === 419)
          message = tFeedback("sessionExpired");
        else if (error.status === 422 && error.message) message = error.message;
      } else if (error instanceof TypeError) {
        message = tFeedback("network");
      }

      console.error(`[cart] ${action} failed`, error);
      showFeedback({ title, message });
    },
    [showFeedback, tFeedback],
  );

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
      // An explicit per-call delivery type always wins over the channel.
      const deliveryType: DeliveryType = item.deliveryType ?? channelDeliveryType;

      // GA4 item for the add_to_cart event (only pushed after success).
      const trackAddedItem = () => {
        trackAddToCart({
          item: buildGA4Item({
            id: productId,
            name: item.name,
            price: item.current_price,
            originalPrice: item.price,
            quantity: item.quantity,
            variantId: item.product_variant_id ?? null,
            sku: item.sku,
          }),
          currency: currencyCode,
        });
      };

      if (!isAuthenticated) {
        if (guestServerMode) {
          // Server-backed guest cart — optimistic like the auth path.
          setOptimisticQuantity((q) => q + item.quantity);
          adjustQuantity(item.quantity);
          setIsPending(true);
          try {
            const cart = await runWithGuestSession(locale, () =>
              guestCartService.addItem(
                {
                  product_id: productId,
                  quantity: item.quantity,
                  product_variant_id: item.product_variant_id ?? null,
                  shipping_method: deliveryType,
                },
                locale,
              ),
            );
            setTotalQuantity(cart?.totalQuantity ?? 0);
          } catch (error) {
            reportError(error, "add");
            rollback(item.quantity);
            return false;
          } finally {
            setIsPending(false);
          }
          trackAddedItem();
          return true;
        }
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
        trackAddedItem();
        return true;
      }

      // Optimistically update UI and badge immediately.
      setOptimisticQuantity((q) => q + item.quantity);
      adjustQuantity(item.quantity);
      setIsPending(true);

      try {
        await cartService.addItem(
          {
            product_id: productId,
            quantity: item.quantity,
            product_variant_id: item.product_variant_id ?? null,
            shipping_method: deliveryType,
          },
          locale,
        );
      } catch (error) {
        reportError(error, "add");
        rollback(item.quantity);
        return false;
      } finally {
        setIsPending(false);
      }
      trackAddedItem();
      return true;
    },
    [
      isAuthenticated,
      guestServerMode,
      productId,
      channelDeliveryType,
      guestAddItem,
      adjustQuantity,
      setTotalQuantity,
      locale,
      rollback,
      reportError,
      currencyCode,
    ],
  );

  // ── increment ────────────────────────────────────────────────────────────
  const increment = useCallback(async () => {
    // GA4 item for the +1 add event (only pushed after success).
    const trackIncrement = (variantId?: number | null) => {
      trackAddToCart({
        item: buildGA4Item({
          id: productId,
          name: product?.name ?? "",
          price: product?.price,
          originalPrice: product?.originalPrice,
          quantity: 1,
          variantId: variantId ?? product?.variantId ?? null,
          sku: product?.sku,
        }),
        currency: currencyCode,
      });
    };

    if (!isAuthenticated) {
      if (guestServerMode) {
        setOptimisticQuantity((q) => q + 1);
        adjustQuantity(1);
        setIsPending(true);
        try {
          const cart = await runWithGuestSession(locale, async () => {
            // Resolve the existing line so a variant line is incremented on
            // the correct variant rather than the base product.
            const current = await guestCartService.getCart(locale);
            const line = findGuestCartLine(
              current,
              productId,
              channelDeliveryType,
            );
            return guestCartService.addItem(
              {
                product_id: productId,
                quantity: 1,
                product_variant_id: line?.productVariantId ?? null,
                shipping_method: channelDeliveryType,
              },
              locale,
            );
          });
          setTotalQuantity(cart?.totalQuantity ?? 0);
        } catch (error) {
          reportError(error, "update");
          rollback(1);
          return;
        } finally {
          setIsPending(false);
        }
        trackIncrement(product?.variantId ?? null);
        return;
      }
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
      trackIncrement(target.product_variant_id);
      return;
    }

    setOptimisticQuantity((q) => q + 1);
    adjustQuantity(1);
    setIsPending(true);

    try {
      await cartService.addItem(
        {
          product_id: productId,
          quantity: 1,
          shipping_method: channelDeliveryType,
        },
        locale,
      );
    } catch (error) {
      reportError(error, "update");
      rollback(1);
      return;
    } finally {
      setIsPending(false);
    }
    trackIncrement(product?.variantId ?? null);
  }, [
    isAuthenticated,
    guestServerMode,
    productId,
    channelDeliveryType,
    guestUpdateQuantity,
    adjustQuantity,
    setTotalQuantity,
    locale,
    rollback,
    reportError,
    product,
    currencyCode,
  ]);

  // ── decrement ────────────────────────────────────────────────────────────
  const decrement = useCallback(async () => {
    // GA4 item for the remove event (only pushed after success). A decrement
    // removes exactly one unit; removing the last unit reports the line qty.
    const trackDecrement = (quantity: number, variantId?: number | null) => {
      trackRemoveFromCart({
        item: buildGA4Item({
          id: productId,
          name: product?.name ?? "",
          price: product?.price,
          originalPrice: product?.originalPrice,
          quantity,
          variantId: variantId ?? product?.variantId ?? null,
          sku: product?.sku,
        }),
        currency: currencyCode,
      });
    };

    if (!isAuthenticated) {
      if (guestServerMode) {
        // Resolve the line from the server cart (cards don't carry line ids).
        setOptimisticQuantity((q) => Math.max(0, q - 1));
        adjustQuantity(-1);
        setIsPending(true);
        try {
          const cart = await runWithGuestSession(locale, async () => {
            const current = await guestCartService.getCart(locale);
            const line = findGuestCartLine(
              current,
              productId,
              channelDeliveryType,
            );
            if (!line) {
              return current;
            }
            // `quantity` is a delta, not the target quantity.
            return line.quantity <= 1
              ? guestCartService.removeLine(
                  line.id,
                  locale,
                  channelDeliveryType,
                )
              : guestCartService.updateItem(
                  {
                    item: {
                      product_id: productId,
                      quantity: 1,
                      operation: "decrement",
                      product_variant_id: line.productVariantId,
                      shipping_method: channelDeliveryType,
                    },
                  },
                  locale,
                );
          });
          setTotalQuantity(cart?.totalQuantity ?? 0);
        } catch (error) {
          reportError(error, "update");
          rollback(-1);
          return;
        } finally {
          setIsPending(false);
        }
        trackDecrement(1, product?.variantId ?? null);
        return;
      }

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
      trackDecrement(1, target.product_variant_id);
      return;
    }

    const currentQty = optimisticQuantity;
    if (currentQty <= 0) return;
    setOptimisticQuantity((q) => Math.max(0, q - 1));
    adjustQuantity(-1);
    setIsPending(true);

    try {
      if (currentQty <= 1) {
        const cart = await cartService.getCart(locale);
        const line = findCartLine(cart, productId, channelDeliveryType);
        if (!line) {
          setTotalQuantity(cart?.total_quantity ?? 0);
          return;
        }
        await cartService.removeItem(line.id, channelDeliveryType, locale);
        setTotalQuantity(
          Math.max(0, (cart?.total_quantity ?? line.quantity) - line.quantity),
        );
      } else {
        const updatedCart = await cartService.updateItem(
          {
            item: {
              product_id: productId,
              quantity: 1,
              operation: "decrement",
              product_variant_id: undefined,
              shipping_method: channelDeliveryType,
            },
          },
          locale,
        );
        setTotalQuantity(updatedCart.total_quantity);
      }
    } catch (error) {
      reportError(error, "update");
      rollback(-1);
      return;
    } finally {
      setIsPending(false);
    }
    // Whole-line removal reports the full line quantity, else a single unit.
    trackDecrement(currentQty <= 1 ? currentQty : 1, product?.variantId ?? null);
  }, [
    isAuthenticated,
    guestServerMode,
    productId,
    optimisticQuantity,
    channelDeliveryType,
    locale,
    guestRemoveItem,
    guestUpdateQuantity,
    adjustQuantity,
    setTotalQuantity,
    rollback,
    reportError,
    product,
    currencyCode,
  ]);

  return useMemo(
    () => ({ quantity, isPending, addItem, increment, decrement }),
    [quantity, isPending, addItem, increment, decrement],
  );
}
