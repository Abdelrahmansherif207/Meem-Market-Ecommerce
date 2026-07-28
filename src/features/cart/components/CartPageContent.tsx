"use client";
import { useEffect, useRef, useReducer, useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ShoppingBag, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useGuestCartStore } from "../store/useGuestCartStore";
import { useServerCartStore } from "../store/useServerCartStore";
import { cartService } from "../services/cartService";
import { CartSection } from "./CartSection";
import { CartSummary } from "./CartSummary";
import AvailableCoupons from "@/features/coupons/components/AvailableCoupons";
import { calcSubtotal, calcTotalQuantity } from "../utils";
import type { AppliedCoupon } from "@/features/coupons/types";
import type { Coupon } from "@/features/coupons/types";
import { couponService } from "@/features/coupons/services/couponService";
import { ApiError } from "@/shared/lib/api";
import type { HydratedCartItem, CartApiItem, CartApiCart } from "../types";


// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------
type CartSource = "guest" | "loading" | "syncing" | "server" | "error";

type CartState = {
  source: CartSource;
  serverItems: HydratedCartItem[];
  error: string | null;
  /** Product IDs whose cart item currently has an in-flight API request. */
  pendingItemIds: Set<number>;
};

type CartAction =
  | { type: "SET_GUEST" }
  | { type: "SET_SYNCING" }
  | { type: "SET_LOADING" }
  | { type: "SET_SERVER"; items: HydratedCartItem[] }
  | { type: "SET_ERROR"; error: string }
  | { type: "UPDATE_ITEM"; productId: number; quantity: number }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "SET_ITEM_ROLLBACK"; items: HydratedCartItem[] }
  | { type: "ITEM_PENDING"; productId: number }
  | { type: "ITEM_DONE"; productId: number };

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
    case "SET_SYNCING":
      return { ...state, source: "syncing", error: null };
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
          i.product_id === action.productId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        serverItems: state.serverItems.filter(
          (i) => i.product_id !== action.productId,
        ),
      };
    case "SET_ITEM_ROLLBACK":
      return { ...state, serverItems: action.items };
    case "ITEM_PENDING": {
      const next = new Set(state.pendingItemIds);
      next.add(action.productId);
      return { ...state, pendingItemIds: next };
    }
    case "ITEM_DONE": {
      const next = new Set(state.pendingItemIds);
      next.delete(action.productId);
      return { ...state, pendingItemIds: next };
    }
    default:
      return state;
  }
}

function deriveInitialSource(
  isAuthenticated: boolean,
  isSyncing: boolean,
): CartSource {
  if (!isAuthenticated) return "guest";
  if (isSyncing) return "syncing";
  return "loading";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface CartPageContentProps {
  minimumOrderAmount: number;
}

export function CartPageContent({ minimumOrderAmount }: CartPageContentProps) {
  const t = useTranslations("cartPage");
  const locale = useLocale();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestItems = useGuestCartStore((s) => s.items);
  const guestRemoveItem = useGuestCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useGuestCartStore((s) => s.updateQuantity);
  const isSyncing = useGuestCartStore((s) => s.isSyncing);
  const syncError = useGuestCartStore((s) => s.syncError);
  const setServerTotalQuantity = useServerCartStore((s) => s.setTotalQuantity);

  // Initialise source synchronously from store — prevents guest spinner flash
  // and correctly shows "syncing" if the hook is mid-sync when the page opens.
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined,
    (): CartState => ({
      source: deriveInitialSource(isAuthenticated, isSyncing),
      serverItems: [],
      error: null,
      pendingItemIds: new Set<number>(),
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
  const couponDiscount = appliedCoupon?.discount_amount ?? 0;
  const [serverSubtotal, setServerSubtotal] = useState<number | null>(null);
  const [serverTotalAfterCoupon, setServerTotalAfterCoupon] = useState<number | null>(null);

  // -------------------------------------------------------------------------
  // processCart — map server cart data into all local state
  // -------------------------------------------------------------------------
  const processCart = useCallback((cart: CartApiCart) => {
    setServerSubtotal(cart.subtotal);
    setServerTotalAfterCoupon(cart.total_after_coupon);

    const mapItem = (item: CartApiItem, deliveryType: "scheduled" | "fast"): HydratedCartItem => ({
      product_id: item.product_id,
      product_variant_id: item.product_variant_id ?? null,
      cartItemId: item.id,
      quantity: item.quantity,
      name: item.product.name,
      image: item.product.thumbnail,
      price: item.price,
      current_price: item.total_price / item.quantity,
      total_price: item.total_price,
      discount_amount: item.discount_amount,
      promotion_id: item.promotion_id,
      slug: item.product.slug,
      sku: "",
      in_stock: true,
      stock_quantity: 999,
      deliveryType,
    });

    const items: HydratedCartItem[] = [];

    if (cart.normal_items) {
      items.push(...cart.normal_items.map((i) => mapItem(i, "scheduled")));
    }
    if (cart.fast_items) {
      items.push(...cart.fast_items.map((i) => mapItem(i, "fast")));
    }

    dispatch({ type: "SET_SERVER", items });

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

  // -------------------------------------------------------------------------
  // refreshCart — silent background re-fetch (no loading spinner)
  // -------------------------------------------------------------------------
  const refreshCart = useCallback(async () => {
    try {
      const cart = await cartService.getCart(locale);
      if (cart) processCart(cart);
    } catch {
      // silent — cart data stays as-is
    }
  }, [locale, processCart]);

  // -------------------------------------------------------------------------
  // loadServerCart — initial fetch with loading state + abort support
  // -------------------------------------------------------------------------
  const loadServerCart = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "SET_LOADING" });

    try {
      const cart = await cartService.getCart(locale);
      if (controller.signal.aborted) return;

      if (cart) {
        processCart(cart);
      } else {
        dispatch({ type: "SET_SERVER", items: [] });
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const status = err instanceof ApiError ? err.status : 0;
      const msg = status === 401
        ? "Your session has expired. Please log in again."
        : err instanceof Error ? err.message : "Failed to load cart";
      dispatch({ type: "SET_ERROR", error: msg });
    }
  }, [locale, processCart]);

  // -------------------------------------------------------------------------
  // Auth / sync state machine effect
  //
  // Key design: NO didLoadRef. React effects always fire on component mount,
  // so navigate-away → navigate-back naturally re-triggers this effect and
  // re-loads the cart. loadServerCart() cancels any duplicate in-flight request
  // via abortRef, so calling it multiple times is safe.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      abortRef.current?.abort();
      dispatch({ type: "SET_GUEST" });
      return;
    }

    if (isSyncing) {
      // Guest cart is being bulk-uploaded. Show syncing UI; when isSyncing
      // flips to false this effect will re-run and kick off loadServerCart().
      dispatch({ type: "SET_SYNCING" });
      return;
    }

    if (syncError) {
      // Sync failed — fall back to guest items so the user can retry.
      dispatch({ type: "SET_GUEST" });
      return;
    }

    // Authenticated and sync complete (or no guest items): load from server.
    loadServerCart();
  }, [isAuthenticated, isSyncing, syncError, loadServerCart]);

  // Abort any in-flight request on unmount (navigation away).
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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
    async (productId: number, quantity: number) => {
      // Guest path — mutate store
      if (state.source !== "server") {
        if (quantity <= 0) {
          guestRemoveItem(productId);
        } else {
          guestUpdateQuantity(productId, quantity);
        }
        return;
      }

      const item = state.serverItems.find((i) => i.product_id === productId);
      if (!item || !item.cartItemId) return;
      if (state.pendingItemIds.has(productId)) return;

      const snapshot = state.serverItems;
      dispatch({ type: "ITEM_PENDING", productId });

      try {
        if (quantity <= 0) {
          dispatch({ type: "REMOVE_ITEM", productId });
          await cartService.removeItem(item.cartItemId, locale);
        } else {
          dispatch({ type: "UPDATE_ITEM", productId, quantity });
          const updatedCart = await cartService.updateItem({ item: { product_id: productId, quantity, product_variant_id: item.product_variant_id ?? null } }, locale);
          processCart(updatedCart);
        }
      } catch {
        dispatch({ type: "SET_ITEM_ROLLBACK", items: snapshot });
      } finally {
        dispatch({ type: "ITEM_DONE", productId });
      }
    },
    [
      state.source,
      state.serverItems,
      state.pendingItemIds,
      locale,
      guestRemoveItem,
      guestUpdateQuantity,
      processCart,
    ],
  );

  const handleRemove = useCallback(
    (productId: number) => handleUpdateQuantity(productId, 0),
    [handleUpdateQuantity],
  );

  const handleRetryLoad = useCallback(() => {
    loadServerCart();
  }, [loadServerCart]);

  // -------------------------------------------------------------------------
  // Retry sync (when syncError is set)
  // -------------------------------------------------------------------------
  const handleRetrySync = useCallback(() => {
    const { items, getSyncPayload, setSyncing, setSyncError, clearCart } =
      useGuestCartStore.getState();

    if (items.length === 0) {
      loadServerCart();
      return;
    }

    setSyncing(true);
      cartService
      .addBulkToCart(getSyncPayload(), locale)
      .then(() => {
        clearCart();
        setSyncing(false);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to sync your cart. Please try again.";
        setSyncError(message);
      });
  }, [loadServerCart, locale]);

  // -------------------------------------------------------------------------
  // Derived display data
  // -------------------------------------------------------------------------
  const displayItems: HydratedCartItem[] =
    state.source === "server" ? state.serverItems : guestItems.map((g) => ({
      ...g,
      name: g.name ?? `Product #${g.product_id}`,
      image: g.image ?? "",
      price: g.price ?? 0,
      current_price: g.current_price ?? 0,
      slug: g.slug ?? "",
      sku: g.sku ?? "",
      in_stock: g.in_stock ?? false,
      stock_quantity: g.stock_quantity ?? 0,
    }));

  const scheduledItems = displayItems.filter((i) => i.deliveryType === "scheduled");
  const fastItems = displayItems.filter((i) => i.deliveryType === "fast");

  const scheduledSubtotal = calcSubtotal(
    scheduledItems.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const fastSubtotal = calcSubtotal(
    fastItems.map((i) => ({ price: i.current_price, quantity: i.quantity })),
  );
  const scheduledQty = calcTotalQuantity(scheduledItems);
  const fastQty = calcTotalQuantity(fastItems);

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (state.source === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (state.source === "syncing") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Syncing your cart…
        </p>
      </div>
    );
  }

  if (state.source === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-gray-500">{state.error}</p>
        <button
          onClick={handleRetryLoad}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sync error banner */}
      {syncError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Some items from your guest cart could not be synced:{" "}
              <strong>{syncError}</strong>
            </span>
          </div>
          <button
            onClick={handleRetrySync}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry sync
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("title")}</h2>
      </div>

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-gray-200" />
          <h2 className="text-xl font-bold">{t("emptyTitle")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("emptyDescription")}</p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {t("startShopping")}
          </Link>
        </div>
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
            />
            <CartSection
              deliveryType="fast"
              items={fastItems}
              pendingItemIds={state.pendingItemIds}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              minimumOrderAmount={minimumOrderAmount}
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
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary
                scheduledSubtotal={scheduledSubtotal}
                scheduledQty={scheduledQty}
                fastSubtotal={fastSubtotal}
                fastQty={fastQty}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                onCouponApplied={async () => { await refreshCart(); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}