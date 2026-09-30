"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { couponService } from "../services/couponService";

interface UseCouponClaimsState {
  claimedCouponIds: number[];
  claimingId: number | null;
  loading: boolean;
}

/**
 * Loads the authenticated user's claimed coupon ids (`GET /general/coupons/mine`)
 * and exposes a claim mutation against `POST /general/coupons/{id}/claim`.
 * Claim successes update the id set in-place. Pass `{ enabled: false }` to
 * defer the fetch (e.g. until the notifications dropdown is opened).
 */
export function useCouponClaims(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const locale = useLocale();

  const [state, setState] = useState<UseCouponClaimsState>({
    claimedCouponIds: [],
    claimingId: null,
    loading: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const result = await couponService.getMyCoupons(locale);
    if (result.success) {
      setState({
        claimedCouponIds: result.claims.map((c) => c.coupon_id),
        claimingId: null,
        loading: false,
      });
    } else {
      // If mine fails, treat as "nothing claimed yet" — the Claim button
      // stays visible and claiming itself surfaces server errors.
      setState((s) => ({ ...s, loading: false }));
    }
  }, [locale]);

  useEffect(() => {
    if (!enabled) return;
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [enabled, load]);

  const claim = useCallback(
    async (couponId: number): Promise<boolean> => {
      setState((s) => ({ ...s, claimingId: couponId }));
      const result = await couponService.claimCoupon(couponId, locale);
      setState((s) => ({
        ...s,
        claimingId: null,
        claimedCouponIds:
          result.success && !s.claimedCouponIds.includes(couponId)
            ? [...s.claimedCouponIds, couponId]
            : s.claimedCouponIds,
      }));
      return result.success;
    },
    [locale],
  );

  return {
    claimedCouponIds: state.claimedCouponIds,
    claimingId: state.claimingId,
    loading: state.loading,
    claim,
    reload: load,
  };
}
