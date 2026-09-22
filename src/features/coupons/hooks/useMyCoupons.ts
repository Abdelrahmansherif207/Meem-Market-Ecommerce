"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { couponService } from "../services/couponService";
import type { CouponAssignment } from "../types";

interface UseMyCouponsState {
  assignments: CouponAssignment[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads the authenticated user's coupon assignments (`GET /general/coupons/mine`).
 * Guests get an empty, non-loading state so the UI can hide entirely.
 */
export function useMyCoupons() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [state, setState] = useState<UseMyCouponsState>({
    assignments: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await couponService.getMyCoupons(locale);
    if (result.success) {
      setState({ assignments: result.assignments, loading: false, error: null });
    } else {
      setState((s) => ({
        ...s,
        loading: false,
        error: result.message ?? null,
      }));
    }
  }, [locale]);

  useEffect(() => {
    // Guests keep the default (empty, non-loading) state — MyCouponsList
    // renders nothing for them. State is re-fetched whenever auth flips on.
    // Intentional data-fetch-on-mount (same convention as CartPageContent).
    if (!isAuthenticated) return;
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [isAuthenticated, load]);

  return { ...state, isAuthenticated, reload: load };
}
