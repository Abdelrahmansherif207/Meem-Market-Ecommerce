"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { usePaginatedFetch } from "@/shared/hooks/usePaginatedFetch";
import { couponService } from "../services/couponService";
import type { AvailableCoupon } from "../types";
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
 *
 * Claimed coupons carry their generated code only in `/mine`
 * (`claims[]`, `status: "active"`), so a lightweight `/mine` fetch
 * maintains a `coupon_id → code` map used to offer Copy/Apply on
 * claimed shelf cards after remounts.
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

  const [claimedCodeById, setClaimedCodeById] = useState<Map<number, string>>(() => new Map());
  const [mineRefreshing, setMineRefreshing] = useState(false);
  const active = enabled && isAuthenticated;

  const refreshClaimedCodes = useCallback(async () => {
    if (!active) {
      setClaimedCodeById(new Map());
      return;
    }
    setMineRefreshing(true);
    const result = await couponService.getMyCoupons(locale);
    const next = new Map<number, string>();
    if (result.success) {
      for (const claim of result.claims) {
        if (claim.status === "active") next.set(claim.coupon_id, claim.code);
      }
    }
    // A failed `/mine` keeps the previous map — claimed cards degrade to
    // badge-only instead of disappearing codes.
    if (active) setClaimedCodeById(next);
    setMineRefreshing(false);
  }, [active, locale]);

  useEffect(() => {
    void refreshClaimedCodes(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [refreshClaimedCodes]);

  const split = useMemo(() => {
    const apply: AvailableCoupon[] = [];
    const claim: AvailableCoupon[] = [];
    const claimed: AvailableCoupon[] = [];
    for (const coupon of items) {
      // Server truth wins: a coupon that was already claimed arrives back
      // with `claim_status: "claimed"`, `claim_id` set and `code: null`
      // (and a misleading `action: "apply"`), so it must never be treated
      // as an apply-ready card.
      if (coupon.claim_status === "claimed" || coupon.claim_id != null) {
        claimed.push(coupon);
      } else if (coupon.action === "claim") {
        claim.push(coupon);
      } else if (coupon.code != null) {
        apply.push(coupon);
      }
      // Items that are neither claimable nor carry a code are dropped —
      // renderless shells would produce dead buttons on the shelf.
    }
    return { apply, claim, claimed };
  }, [items]);

  return {
    applyCoupons: split.apply,
    claimCoupons: split.claim,
    claimedCoupons: split.claimed,
    claimedCodeById,
    mineRefreshing,
    meta,
    loading,
    loadingMore,
    error,
    canLoadMore,
    loadMore,
    /** Re-fetches shelf pages + the `/mine` claimed-code map. */
    reload: useCallback(() => {
      void refreshClaimedCodes();
      reload();
    }, [refreshClaimedCodes, reload]),
  } satisfies {
    applyCoupons: AvailableCoupon[];
    claimCoupons: AvailableCoupon[];
    claimedCoupons: AvailableCoupon[];
    claimedCodeById: Map<number, string>;
    mineRefreshing: boolean;
    meta: PageMeta | null;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    canLoadMore: boolean;
    loadMore: () => void;
    reload: () => void;
  };
}
