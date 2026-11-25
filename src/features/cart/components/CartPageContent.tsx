"use client";
import { useEffect, useRef, useReducer, useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useDisplayCurrency } from "@/features/currencies";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { guestCartService } from "@/features/guest/services/guestCartService";
import { useGuestSessionStore } from "@/features/guest/store/useGuestSessionStore";
import { runWithGuestSession } from "@/features/guest/utils/guestErrors";
import { CartPageContentSkeleton } from "./skeletons/CartPageContentSkeleton";
import { MinimumOrderProgress } from "./MinimumOrderProgress";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { useServerCartStore } from "../store/useServerCartStore";
import { cartService } from "../services/cartService";
import { CartSection } from "./CartSection";
import { CartSummary } from "./CartSummary";
import AvailableCoupons from "@/features/coupons/components/AvailableCoupons";
import MyAvailableCoupons from "@/features/coupons/components/MyAvailableCoupons";
import { MyCouponsList } from "@/features/coupons/components/MyCouponsList";
import { calcSubtotal, calcTotalQuantity, canCheckout } from "../utils";
import {
  fromHydratedCartItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  useOncePerKeyEffect,
} from "@/features/analytics";
import type { AppliedCoupon } from "@/features/coupons/types";
import { couponService } from "@/features/coupons/services/couponService";
import { ApiError } from "@/shared/lib/api";
import type { HydratedCartItem, CartApiItem, CartApiCart, CartLineIdentity, DeliveryType, GuestCartItem } from "../types";
import { getCartLineKey, matchesCartLine } from "../types";
import type { GuestCart, GuestCartLine } from "@/features/guest/types";
import { formatGuestDate } from "@/features/guest/lib/format";
import EmptyState from "@/components/ui/EmptyState";


// ---------------------------------------------------------------------------
// GA4 helpers (module scope — used by handlers declared before derived data)
// ---------------------------------------------------------------------------

/** Maps a legacy localStorage guest item into the display cart-item shape. */
function toDisplayGuestItem(g: GuestCartItem): HydratedCartItem {
  return {
    ...g,
    deliveryType: g.deliveryType ?? "scheduled",
    name: g.name ?? `Product #${g.product_id}`,
    image: g.image ?? "",
    price: g.price ?? 0,
    current_price: g.current_price ?? 0,
    slug: g.slug ?? "",
    sku: g.sku ?? "",
    in_stock: g.in_stock ?? false,
    stock_quantity: g.stock_quantity ?? 0,
  };
}

/** Cart-page quantity deltas fire add/remove with the difference only. */
function trackCartQuantityChange(
  item: HydratedCartItem,
  eventQuantity: number,
  direction: "add" | "remove",
  currency: string,
): void {
  const ga4Item = { ...fromHydratedCartItem(item), quantity: eventQuantity };
  const params = { item: ga4Item, currency };
  if (direction === "add") trackAddToCart(params);
  else trackRemoveFromCart(params);
}


// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------
type CartSource = "guest" | "loading" | "server" | "error";

type CartState = {
  source: CartSource;
  serverItems: HydratedCartItem[];
  error: string | null;
  /** Cart line keys (product + variant) with an in-flight API request. */
  pendingItemIds: Set<string>;
};

type CartAction =
  | { type: "SET_GUEST" }
  | { type: "SET_LOADING" }
  | { type: "SET_SERVER"; items: HydratedCartItem[] }
  | { type: "SET_ERROR"; error: string }
  | { type: "UPDATE_ITEM"; productId: number; quantity: number; line: CartLineIdentity }
  | { type: "REMOVE_ITEM"; productId: number; line: CartLineIdentity }
  | { type: "SET_ITEM_ROLLBACK"; items: HydratedCartItem[] }
  | { type: "ITEM_PENDING"; key: string }
  | { type: "ITEM_DONE"; key: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_GUEST":
      return {
        ...state,
        source: "guest",
        serverItems: [],
        error: null,
        pendingItemIds: new Set(),
      };
    case "SET_LOADING":
      return { ...state, source: "loading", error: null };
    case "SET_SERVER":
      return {
        ...state,
        source: "server",
        serverItems: action.items,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, source: "error", error: action.error };
    case "UPDATE_ITEM":
      return {
        ...state,
        serverItems: state.serverItems.map((i) =>
          matchesCartLine(i, action.productId, action.line)
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        serverItems: state.serverItems.filter(
          (i) => !matchesCartLine(i, action.productId, action.line),
        ),
      };
    case "SET_ITEM_ROLLBACK":
      return { ...state, serverItems: action.items };
    case "ITEM_PENDING": {
      const next = new Set(state.pendingItemIds);
      next.add(action.key);
      return { ...state, pendingItemIds: next };
    }
    case "ITEM_DONE": {
      const next = new Set(state.pendingItemIds);
      next.delete(action.key);
      return { ...state, pendingItemIds: next };
    }
    default:
      return state;
  }
}

function deriveInitialSource(
  isAuthenticated: boolean,
  authHydrated: boolean,
): CartSource {
  if (!authHydrated) return "loading";
  if (!isAuthenticated) return "guest";
  return "loading";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface CartPageContentProps {
  minimumOrderAmount: number;
  taxEnabled?: boolean;
  taxRate?: number | null;
}

export function CartPageContent({
  minimumOrderAmount,
  taxEnabled = false,
  taxRate = null,
}: CartPageContentProps) {
  const t = useTranslations("cartPage");
  const locale = useLocale();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Flag ON + anonymous: use the server-backed guest cart. Once the shopper
  // logs in, the guest cart is merged and destroyed — every read/mutation must
  // switch to the authenticated `/cart` endpoints instead.
  const guestServerMode = !isAuthenticated && isGuestCheckoutEnabled();
  // Effective display currency (backend-driven): silent server-cart refetches
  // key off it, matching the `X-Currency` header client `apiFetch` attaches.
  const displayCurrency = useDisplayCurrency();
  const guestItems = useGuestCartStore((s) => s.items);
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const setServerTotalQuantity = useServerCartStore((s) => s.setTotalQuantity);

  // The auth store rehydrates from localStorage asynchronously. Until that
  // finishes, `isAuthenticated` is a stale `false` — trusting it caused the
  // reload flash "empty cart → loading → cart". Same pattern as CheckoutForm.
  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setAuthHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect
    return unsub;
  }, []);

  // Initialise source synchronously from store — prevents a guest spinner
  // flash while auth metadata rehydrates.
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined,
    (): CartState => ({
      source: deriveInitialSource(isAuthenticated, authHydrated),
      serverItems: [],
      error: null,
      pendingItemIds: new Set<string>(),
    }),
  );

  // AbortController for the active getCart / getProduct fetch chain.
  // We do NOT use a ref that persists across remounts for "did load" tracking —
  // that pattern caused the infinite spinner when navigating away and back,
  // because useRef values survive Strict-Mode remounts and navigation remounts
  // while useReducer state resets. Instead we rely on the fact that React
  // effects always run on mount; loadServerCart() itself is idempotent (it
  // cancels any in-flight request and starts fresh).
  const abortRef = useRef<AbortController | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [guestTotals, setGuestTotals] = useState<{
    shipping: number;
    total: number;
  } | null>(null);
  const [guestExpiry, setGuestExpiry] = useState<string | null>(null);
  const [stickyTop, setStickyTop] = useState<number | null>(null);
  const couponDiscount = appliedCoupon?.discount_amount ?? 0;

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () =>
      setStickyTop(window.innerWidth >= 1024 ? header.offsetHeight + 24 : null);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);


  // -------------------------------------------------------------------------
  // processCart — map server cart data into all local state
  // -------------------------------------------------------------------------
  const processAuthCart = useCallback((cart: CartApiCart) => {
    const mapItem = (
      item: CartApiItem,
      deliveryType: DeliveryType,
    ): HydratedCartItem => {
      return {
        product_id: item.product_id,
        product_variant_id: item.product_variant_id ?? null,
        cartItemId: item.id,
        quantity: item.quantity,
        deliveryType,
        variant_label: item.attributes?.length
          ? item.attributes.map((a) => `${a.attribute}: ${a.value}`).join(" / ")
          : null,
        name: item.product.name,
        image: item.product.thumbnail,
        price: item.price,
        current_price: item.quantity > 0 ? item.total_price / item.quantity : item.price,
        total_price: item.total_price,
        discount_amount: item.discount_amount,
        promotion_id: item.promotion_id,
        slug: item.product.slug,
        sku: "",
        // Server cart items are reserved, but the cart API exposes no stock
        // count — leave stock_quantity unset rather than fabricating one.
        in_stock: true,
        stock_quantity: undefined,
      };
    };

    const items: HydratedCartItem[] = [];

    if (cart.normal_items) {
      items.push(...cart.normal_items.map((i) => mapItem(i, "scheduled")));
    }
    if (cart.fast_items) {
      items.push(...cart.fast_items.map((i) => mapItem(i, "fast")));
    }

    dispatch({ type: "SET_SERVER", items });
    setGuestTotals(null);
    setGuestExpiry(null);

    if (cart.coupon && cart.coupon_code) {
      setAppliedCoupon({
        code: cart.coupon_code,
        name: cart.coupon.name,
        discount_amount: cart.coupon_discount,
      });
    } else {
      setAppliedCoupon(null);
    }
  }, []);

  const processGuestCart = useCallback((cart: GuestCart) => {
    const mapLine = (line: GuestCartLine): HydratedCartItem => ({
      product_id: line.productId,
      product_variant_id: line.productVariantId,
      cartItemId: line.id,
      quantity: line.quantity,
      deliveryType: line.shippingMethod,
      variant_label: line.attributes.length
        ? line.attributes.map((a) => `${a.attribute}: ${a.value}`).join(" / ")
        : null,
      name: line.name,
      image: line.image,
      price: line.unitPrice,
      current_price: line.unitPrice,
      total_price: line.subtotal,
      discount_amount: 0,
      promotion_id: null,
      slug: line.slug,
      sku: line.sku,
      in_stock: line.isAvailable,
      stock_quantity: undefined,
    });

    dispatch({ type: "SET_SERVER", items: cart.items.map(mapLine) });
    setGuestTotals({ shipping: cart.shippingCost, total: cart.total });
    setGuestExpiry(cart.expiresAt);
    // Guest carts never carry coupons.
    setAppliedCoupon(null);
  }, []);

  const processCart = useCallback(
    (cart: CartApiCart | GuestCart) => {
      if (guestServerMode) processGuestCart(cart as GuestCart);
      else processAuthCart(cart as CartApiCart);
    },
    [guestServerMode, processGuestCart, processAuthCart],
  );

  // -------------------------------------------------------------------------
  // refreshCart — silent background re-fetch (no loading spinner)
  // -------------------------------------------------------------------------
  const refreshCart = useCallback(async () => {
    try {
      const cart = guestServerMode
        ? await runWithGuestSession(locale, () => guestCartService.getCart(locale))
        : await cartService.getCart(locale);
      if (cart) {
        processCart(cart);
      } else {
        dispatch({ type: "SET_SERVER", items: [] });
        setGuestTotals(null);
        setGuestExpiry(null);
      }
    } catch {
      // silent — cart data stays as-is
    }
  }, [guestServerMode, locale, processCart]);

  // -------------------------------------------------------------------------
  // loadServerCart — initial fetch with loading state + abort support
  // -------------------------------------------------------------------------
  const loadServerCart = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "SET_LOADING" });

    try {
      const cart = guestServerMode
        ? await (async () => {
            await useGuestSessionStore.getState().ensureSession(locale);
            return runWithGuestSession(locale, () =>
              guestCartService.getCart(locale),
            );
          })()
        : await cartService.getCart(locale);
      if (controller.signal.aborted) return;

      if (cart) {
        processCart(cart);
      } else {
        dispatch({ type: "SET_SERVER", items: [] });
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const status = err instanceof ApiError ? err.status : 0;
      const msg =
        status === 401 ? t("sessionExpired") : t("loadFailed");
      dispatch({ type: "SET_ERROR", error: msg });
    }
  }, [guestServerMode, locale, processCart, t]);

  // -------------------------------------------------------------------------
  // Auth / sync state machine effect
  //
  // Key design: NO didLoadRef. React effects always fire on component mount,
  // so navigate-away → navigate-back naturally re-triggers this effect and
  // re-loads the cart. loadServerCart() cancels any duplicate in-flight request
  // via abortRef, so calling it multiple times is safe.
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Auth metadata is still rehydrating — don't trust the stale
    // `isAuthenticated: false` snapshot to dispatch SET_GUEST or fetch.
    if (!authHydrated) return;

    if (!isAuthenticated) {
      abortRef.current?.abort();
      // Flag ON: anonymous users load the server-backed guest cart (the
      // legacy localStorage path remains the fallback when disabled).
      if (guestServerMode) {
        loadServerCart(); // eslint-disable-line react-hooks/set-state-in-effect
        return;
      }
      dispatch({ type: "SET_GUEST" });
      return;
    }

    // Authenticated: the backend has already merged the guest cart into this
    // account, so the authenticated server cart is authoritative.
    loadServerCart();
  }, [authHydrated, isAuthenticated, guestServerMode, loadServerCart]);

  // Abort any in-flight request on unmount (navigation away).
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Silently re-fetch server cart prices when the currency changes. The
  // client already attaches `X-Currency` to `getCart`; the mount load
  // covers first paint, so skip the initial run. Guest carts are priced
  // locally at add-to-cart time and are unaffected.
  const currencyMounted = useRef(false);
  useEffect(() => {
    if (!currencyMounted.current) {
      currencyMounted.current = true;
      return;
    }
    if (state.source === "server") {
      refreshCart(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [displayCurrency.code, state.source, refreshCart]);

  // Keep the header badge in sync with whatever items the cart page is showing.
  useEffect(() => {
    if (state.source === "server") {
      setServerTotalQuantity(calcTotalQuantity(state.serverItems));
    }
  }, [state.source, state.serverItems, setServerTotalQuantity]);

  // -------------------------------------------------------------------------
  // Handlers — optimistic update with snapshot rollback on error
  // -------------------------------------------------------------------------
  const handleUpdateQuantity = useCallback(
    async (productId: number, quantity: number, line: CartLineIdentity) => {
      // Guest path — mutate store
      if (state.source !== "server") {
        const item = guestItems
          .map(toDisplayGuestItem)
          .find((i) => matchesCartLine(i, productId, line));
        if (quantity <= 0) {
          guestRemoveItem(productId, line);
          if (item) trackCartQuantityChange(item, item.quantity, "remove", displayCurrency.code);
        } else {
          guestUpdateQuantity(productId, quantity, line);
          const delta = Math.abs(quantity - (item?.quantity ?? 0));
          if (item && delta > 0) {
            trackCartQuantityChange(
              item,
              delta,
              quantity > item.quantity ? "add" : "remove",
              displayCurrency.code,
            );
          }
        }
        return;
      }

      const item = state.serverItems.find((i) => matchesCartLine(i, productId, line));
      if (!item || !item.cartItemId) return;
      const itemId = item.cartItemId;
      const deliveryType = item.deliveryType ?? line.deliveryType ?? "scheduled";
      const pendingKey = getCartLineKey(productId, {
        productVariantId: item.product_variant_id ?? null,
        deliveryType,
      });
      if (state.pendingItemIds.has(pendingKey)) return;

      const snapshot = state.serverItems;
      // The update endpoint treats `quantity` as a delta for both authenticated
      // and guest carts — send the absolute difference, never the target.
      const delta = Math.abs(quantity - item.quantity);
      if (delta === 0) return;

      dispatch({ type: "ITEM_PENDING", key: pendingKey });

      try {
        if (quantity <= 0) {
          dispatch({ type: "REMOVE_ITEM", productId, line });
          if (guestServerMode) {
            const cart = await runWithGuestSession(locale, () =>
              guestCartService.removeLine(itemId, locale, deliveryType),
            );
            if (cart) {
              processCart(cart);
            } else {
              dispatch({ type: "SET_SERVER", items: [] });
              setGuestTotals(null);
              setGuestExpiry(null);
            }
          } else {
            await cartService.removeItem(itemId, deliveryType, locale);
          }
          // Whole line removed — report the pre-mutation line quantity.
          trackCartQuantityChange(item, item.quantity, "remove", displayCurrency.code);
        } else {
          dispatch({ type: "UPDATE_ITEM", productId, quantity, line });
          const operation = quantity > item.quantity ? "increment" : "decrement";
          const payload = {
            item: {
              product_id: productId,
              quantity: delta,
              operation,
              product_variant_id: item.product_variant_id ?? null,
              shipping_method: deliveryType,
            },
          } as const;
          if (guestServerMode) {
            const updatedCart = await runWithGuestSession(locale, () =>
              guestCartService.updateItem(payload, locale),
            );
            if (updatedCart) {
              processCart(updatedCart);
            } else {
              dispatch({ type: "SET_SERVER", items: [] });
              setGuestTotals(null);
              setGuestExpiry(null);
            }
          } else {
            const updatedCart = await cartService.updateItem(payload, locale);
            processCart(updatedCart);
          }
          // Difference-only add/remove after the mutation succeeded.
          trackCartQuantityChange(
            item,
            delta,
            quantity > item.quantity ? "add" : "remove",
            displayCurrency.code,
          );
        }
      } catch {
        dispatch({ type: "SET_ITEM_ROLLBACK", items: snapshot });
      } finally {
        dispatch({ type: "ITEM_DONE", key: pendingKey });
      }
    },
    [
      state.source,
      state.serverItems,
      state.pendingItemIds,
      guestServerMode,
      locale,
      guestRemoveItem,
      guestUpdateQuantity,
      processCart,
      guestItems,
      displayCurrency.code,
    ],
  );

  const handleRemove = useCallback(
    (productId: number, line: CartLineIdentity) => handleUpdateQuantity(productId, 0, line),
    [handleUpdateQuantity],
  );

  const handleRetryLoad = useCallback(() => {
    loadServerCart();
  }, [loadServerCart]);

  // -------------------------------------------------------------------------
  // Derived display data
  // -------------------------------------------------------------------------
  const displayItems: HydratedCartItem[] =
    state.source === "server" ? state.serverItems : guestItems.map(toDisplayGuestItem);

  const scheduledItems = displayItems.filter(
    (i) => i.deliveryType === "scheduled",
  );
  const fastItems = displayItems.filter((i) => i.deliveryType === "fast");
  const scheduledSubtotal = calcSubtotal(
    scheduledItems.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const fastSubtotal = calcSubtotal(
    fastItems.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const scheduledQty = calcTotalQuantity(scheduledItems);
  const fastQty = calcTotalQuantity(fastItems);

  // GA4 view_cart — once per cart page view, only when the cart actually
  // loaded with items (after auth hydration / cart fetch resolved).
  useOncePerKeyEffect(
    (state.source === "server" || state.source === "guest") &&
      displayItems.length > 0
      ? "view_cart"
      : null,
    () => {
      trackViewCart({
        items: displayItems.map(fromHydratedCartItem),
        value: Math.round((scheduledSubtotal + fastSubtotal) * 1000) / 1000,
        currency: displayCurrency.code,
        coupon: appliedCoupon?.code,
      });
    },
  );

  // Anonymous shoppers with the flag ON checkout their whole cart in one
  // guest order, so the CTA is cart-level instead of per delivery group.
  const isGuestCart = guestServerMode;
  const guestCheckoutReady = canCheckout(
    scheduledSubtotal + fastSubtotal,
    minimumOrderAmount,
  );

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (state.source === "loading") {
    return <CartPageContentSkeleton />;
  }

  if (state.source === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-text-secondary">{state.error}</p>
        <button
          onClick={handleRetryLoad}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="h-4 w-4" />
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold">{t("title")}</h2>
      </div>

      {displayItems.length === 0 ? (
        <EmptyState
          variant="cart"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actions={
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              {t("startShopping")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CartSection
              deliveryType="scheduled"
              items={scheduledItems}
              pendingItemIds={state.pendingItemIds}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              minimumOrderAmount={minimumOrderAmount}
              hideCheckout={isGuestCart}
              couponSlot={
                isAuthenticated ? (
                  <MyCouponsList
                    appliedCouponCode={appliedCoupon?.code ?? null}
                    onApplied={refreshCart}
                  />
                ) : null
              }
            />
            <CartSection
              deliveryType="fast"
              items={fastItems}
              pendingItemIds={state.pendingItemIds}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              minimumOrderAmount={minimumOrderAmount}
              hideCheckout={isGuestCart}
            />
          </div>

          <div className="lg:col-span-1">
            <div
              className="space-y-6 lg:sticky lg:top-24"
              style={stickyTop !== null ? { top: stickyTop } : undefined}
            >
              <CartSummary
                scheduledSubtotal={scheduledSubtotal}
                scheduledQty={scheduledQty}
                fastSubtotal={fastSubtotal}
                fastQty={fastQty}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                taxEnabled={taxEnabled}
                taxRate={taxRate}
                shippingAmount={isGuestCart ? guestTotals?.shipping ?? null : null}
                authoritativeTotal={isGuestCart ? guestTotals?.total ?? null : null}
                onCouponApplied={async () => { await refreshCart(); }}
              />

              {isGuestCart && (
                <div className="space-y-4 rounded-2xl border-2 border-border bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary">
                        {t("guestCheckoutTitle")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        {t("guestCheckoutHint")}
                      </p>
                    </div>
                  </div>

                  <MinimumOrderProgress
                    subtotal={scheduledSubtotal + fastSubtotal}
                    minimumOrderAmount={minimumOrderAmount}
                    className="rounded-xl bg-surface px-3.5 py-3"
                  />

                  {guestCheckoutReady ? (
                    <LocaleLink
                      href="/guest-checkout"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      {t("guestCheckout")}
                    </LocaleLink>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/45 px-6 py-3 text-sm font-bold text-white"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      {t("guestCheckout")}
                    </button>
                  )}

                  {guestExpiry && (
                    <p className="text-center text-xs leading-relaxed text-text-secondary">
                      {t("guestExpiry", {
                        date: formatGuestDate(guestExpiry, locale),
                      })}
                    </p>
                  )}
                </div>
              )}
              {isAuthenticated && (
                <>
                  <MyAvailableCoupons
                    appliedCouponCode={appliedCoupon?.code ?? null}
                    onCouponApplied={async () => {
                      await refreshCart();
                    }}
                  />
                  <AvailableCoupons
                    onSelectCoupon={async (coupon) => {
                      if (isAuthenticated) {
                        await couponService.removeCoupon(locale);
                      }
                      await couponService.applyCoupon(coupon.code, locale);
                      await refreshCart();
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}