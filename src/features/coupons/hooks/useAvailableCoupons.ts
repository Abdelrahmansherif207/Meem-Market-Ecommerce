"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { usePaginatedFetch } from "@/shared/hooks/usePaginatedFetch";
import { couponService } from "../services/couponService";
import type { AvailableCoupon, AvailableCouponAction } from "../types";
import type { PageMeta } from "@/shared/types";

interface UseAvailableCouponsOptions {
  enabled?: boolean;
  limit?: number;
}

/**
 * Loads the authenticated customer's personalized coupon shelf
 * (`GET /general/coupons/available`). Guests stay empty and non-loading
 * so the UI can hide entirely. Appends pages while `has_more_pages`;
 * never trusts `meta.total` (it is scoped to the current page).
 */
export function useAvailableCoupons(options?: UseAvailableCouponsOptions) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? 15;
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { items, meta, loading, loadingMore, error, canLoadMore, loadMore, reload } =
    usePaginatedFetch<AvailableCoupon>(
      async (page, pageSize) => {
        const result = await couponService.getAvailableCoupons(locale, page, pageSize);
        return { items: result.items, meta: result.meta };
      },
      {
        enabled: enabled && isAuthenticated,
        limit,
        resetKey: locale,
        getItemId: (coupon) => coupon.id,
      },
    );

  const split = useMemo(() => {
    const apply: AvailableCoupon[] = [];
    const claim: AvailableCoupon[] = [];
    for (const coupon of items) {
      (coupon.action === "claim" ? claim : apply).push(coupon);
    }
    return { apply, claim } satisfies Record<AvailableCouponAction, AvailableCoupon[]>;
  }, [items]);

  return {
    applyCoupons: split.apply,
    claimCoupons: split.claim,
    meta,
    loading,
    loadingMore,
    error,
    canLoadMore,
    loadMore,
    reload,
  } satisfies {
    applyCoupons: AvailableCoupon[];
    claimCoupons: AvailableCoupon[];
    meta: PageMeta | null;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    canLoadMore: boolean;
    loadMore: () => void;
    reload: () => void;
  };
}
