"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cartService } from "@/features/cart/services/cartService";
import { checkoutService } from "../services/checkoutService";
import { governorateService } from "../services/governorateService";
import { orderFlowService } from "../services/orderFlowService";
import { addressService } from "@/features/profile/services/addressService";
import type { Address } from "@/features/profile/types";
import type { AppliedCoupon } from "@/features/coupons/types";
import type { CartApiCart } from "@/features/cart/types";
import type { ApiError } from "@/shared/lib/api";
import type {
  EligiblePromotion,
  Governorate,
  OrderFlowDefinition,
  PaymentGatewayOption,
  ShippingType,
} from "../types";
import { SHIPPING_TYPE_CODES } from "../types";

export interface CartCheckoutData {
  subtotal: number;
  totalQuantity: number;
  couponDiscount: number;
  appliedCoupon: AppliedCoupon | null;
  expired: boolean;
}

const EMPTY_CART: CartCheckoutData = {
  subtotal: 0,
  totalQuantity: 0,
  couponDiscount: 0,
  appliedCoupon: null,
  expired: true,
};

function toCartData(cart: CartApiCart | null): CartCheckoutData {
  if (!cart) return EMPTY_CART;
  const appliedCoupon: AppliedCoupon | null = cart.coupon && cart.coupon_code
    ? { code: cart.coupon_code, name: cart.coupon.name, discount_amount: cart.coupon_discount }
    : null;
  return {
    subtotal: cart.subtotal,
    totalQuantity: cart.total_quantity,
    couponDiscount: cart.coupon_discount,
    appliedCoupon,
    expired: false,
  };
}

interface UseCheckoutDataArgs {
  locale: string;
  /** Selected display currency — cart totals re-fetch when it changes. */
  currency: string;
  hydrated: boolean;
  isAuthenticated: boolean;
  shippingType: ShippingType;
  /** Called when the API reports the shipping type is unsupported for this store. */
  onShippingTypeUnsupported?: (type: ShippingType) => void;
  /** Called with the first saved address after the address list loads. */
  onFirstAddressSelected?: (address: Address) => void;
}

export function useCheckoutData({
  locale,
  currency,
  hydrated,
  isAuthenticated,
  shippingType,
  onShippingTypeUnsupported,
  onFirstAddressSelected,
}: UseCheckoutDataArgs) {
  const [cartData, setCartData] = useState<CartCheckoutData | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(true);
  const [governoratesError, setGovernoratesError] = useState(false);
  const [gateways, setGateways] = useState<PaymentGatewayOption[] | null>(null);
  const [gatewaysError, setGatewaysError] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [gatewaysRefreshKey, setGatewaysRefreshKey] = useState(0);
  const [availableShippingTypes, setAvailableShippingTypes] = useState<ShippingType[]>(SHIPPING_TYPE_CODES);
  // Flow is keyed by shipping type: while a new definition loads, the old one
  // is hidden automatically (no synchronous state reset needed in effects).
  const [flowState, setFlowState] = useState<{
    type: ShippingType;
    definition: OrderFlowDefinition | null;
    error: boolean;
  } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState(false);
  const [promotions, setPromotions] = useState<EligiblePromotion[] | null>(null);
  const [promotionsError, setPromotionsError] = useState(false);

  const onUnsupportedRef = useRef(onShippingTypeUnsupported);
  const onFirstAddressRef = useRef(onFirstAddressSelected);
  useEffect(() => {
    onUnsupportedRef.current = onShippingTypeUnsupported;
    onFirstAddressRef.current = onFirstAddressSelected;
  });

  // Cart — fetched once per locale+currency (re-fetch when either changes).
  const fetchedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    const key = `${locale}:${currency}`;
    if (fetchedKey.current === key) return;
    fetchedKey.current = key;

    setCartLoading(true);
    cartService.getCart(locale)
      .then((cart: CartApiCart | null) => {
        setCartData(toCartData(cart));
      })
      .catch(() => setCartData(EMPTY_CART))
      .finally(() => setCartLoading(false));
  }, [hydrated, isAuthenticated, locale, currency]);

  // Cart expiry poll (every 30 s).
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const cart = await cartService.getCart(locale);
        if (!cancelled && (!cart || cart.status === "expired")) {
          setCartData((prev) => prev ? { ...prev, expired: true } : prev);
        }
      } catch {}
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, locale]);

  /** Re-reads the coupon state from the server (after coupon apply/remove). */
  const refreshCartCoupon = useCallback(() => {
    cartService.getCart(locale).then((cart) => {
      if (cart) {
        const appliedCoupon: AppliedCoupon | null = cart.coupon && cart.coupon_code
          ? { code: cart.coupon_code, name: cart.coupon.name, discount_amount: cart.coupon_discount }
          : null;
        setCartData((prev) => prev ? {
          ...prev,
          couponDiscount: cart.coupon_discount,
          appliedCoupon,
        } : prev);
      }
    }).catch(() => {});
  }, [locale]);

  // Governorates
  useEffect(() => {
    let cancelled = false;
    governorateService.getAll(locale)
      .then((data) => {
        if (cancelled) return;
        setGovernorates(data);
        setGovernoratesError(false);
        setGovernoratesLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGovernoratesError(true);
        setGovernoratesLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale]);

  const retryGovernorates = useCallback(() => {
    setGovernoratesError(false);
    setGovernoratesLoading(true);
    governorateService.getAll(locale)
      .then((data) => {
        setGovernorates(data);
        setGovernoratesLoading(false);
      })
      .catch(() => {
        setGovernoratesError(true);
        setGovernoratesLoading(false);
      });
  }, [locale]);

  // Payment gateways
  useEffect(() => {
    let cancelled = false;
    checkoutService.getPaymentGateways(locale)
      .then((list) => {
        if (cancelled) return;
        const eligible = list.filter((g) => g.supports_catalog_currency);
        setGateways(eligible);
        setSelectedGateway((prev) =>
          prev && eligible.some((g) => g.code === prev) ? prev : eligible[0]?.code ?? null,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setGateways([]);
        setGatewaysError(true);
      });
    return () => { cancelled = true; };
  }, [locale, gatewaysRefreshKey]);

  const retryGateways = useCallback(() => {
    setGateways(null);
    setGatewaysError(false);
    setGatewaysRefreshKey((key) => key + 1);
  }, []);

  // Order flow definition (auth-gated; unsupported types fall back).
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let cancelled = false;
    orderFlowService.getByShippingType(shippingType, locale)
      .then((definition) => {
        if (cancelled) return;
        setFlowState({
          type: shippingType,
          definition: definition?.inputs && definition.inputs.length > 0 ? definition : null,
          error: false,
        });
      })
      .catch((err: ApiError | unknown) => {
        if (cancelled) return;
        const status = (err as ApiError).status;
        const message = ((err as ApiError).message ?? "").toLowerCase();
        if (status === 422 && (message.includes("not supported") || message.includes("not available"))) {
          // Shipping option unsupported for this store/account: hide it and
          // fall back to the remaining flow (or classic checkout).
          setAvailableShippingTypes((prev) => prev.filter((t) => t !== shippingType));
          setFlowState({ type: shippingType, definition: null, error: false });
          onUnsupportedRef.current?.(shippingType);
          return;
        }
        // Neutral small error + classic checkout fallback (no flow_values).
        setFlowState({ type: shippingType, definition: null, error: true });
      });
    return () => { cancelled = true; };
  }, [shippingType, locale, hydrated, isAuthenticated]);

  // Saved addresses
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let cancelled = false;
    addressService.getAll(locale)
      .then((data) => {
        if (cancelled) return;
        setSavedAddresses(data);
        setAddressesError(false);
        setAddressesLoading(false);
        if (data.length > 0) onFirstAddressRef.current?.(data[0]);
      })
      .catch(() => {
        if (cancelled) return;
        setAddressesError(true);
        setAddressesLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale, hydrated, isAuthenticated]);

  const retryAddresses = useCallback(() => {
    setAddressesError(false);
    setAddressesLoading(true);
    addressService.getAll(locale)
      .then((data) => {
        setSavedAddresses(data);
        if (data.length > 0) onFirstAddressRef.current?.(data[0]);
        setAddressesLoading(false);
      })
      .catch(() => {
        setAddressesLoading(false);
        setAddressesError(true);
      });
  }, [locale]);

  /** Appends a newly created address (map pick) to the saved list. */
  const addSavedAddress = useCallback((address: Address) => {
    setSavedAddresses((prev) => [...prev, address]);
  }, []);

  // Eligible promotions
  useEffect(() => {
    let cancelled = false;
    checkoutService.getEligiblePromotions(locale)
      .then((data) => {
        if (cancelled) return;
        setPromotions(data);
        setPromotionsError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPromotions([]);
        setPromotionsError(true);
      });
    return () => { cancelled = true; };
  }, [locale]);

  const retryPromotions = useCallback(() => {
    setPromotionsError(false);
    setPromotions(null);
    checkoutService.getEligiblePromotions(locale)
      .then((data) => {
        setPromotions(data);
        setPromotionsError(false);
      })
      .catch(() => {
        setPromotions([]);
        setPromotionsError(true);
      });
  }, [locale]);

  // Derive the flow for the *current* shipping type (stale types hidden).
  const flow = flowState && flowState.type === shippingType ? flowState.definition : null;
  const flowError = flowState ? flowState.type === shippingType && flowState.error : false;

  return {
    cartData,
    cartLoading,
    refreshCartCoupon,
    governorates,
    governoratesLoading,
    governoratesError,
    retryGovernorates,
    gateways,
    gatewaysError,
    retryGateways,
    selectedGateway,
    setSelectedGateway,
    availableShippingTypes,
    flow,
    flowError,
    savedAddresses,
    addressesLoading,
    addressesError,
    retryAddresses,
    addSavedAddress,
    promotions,
    promotionsError,
    retryPromotions,
  };
}
