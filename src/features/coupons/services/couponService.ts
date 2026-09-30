import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse, PageMeta } from "@/shared/types";
import type {
  Coupon,
  ApplyCouponResponse,
  AppliedCoupon,
  MyCouponsData,
  MyCouponsResult,
  CouponClaim,
  ClaimCouponResponse,
  AvailableCoupon,
  AvailableCouponsData,
} from "../types";

export type RemoveCouponResult =
  | { success: true }
  | { success: false; message: string; status?: number };

export const clampPage = (page: number): number => Math.max(1, Math.trunc(page) || 1);
export const clampLimit = (limit: number): number => Math.min(50, Math.max(1, Math.trunc(limit) || 1));

export const couponService = {
  /**
   * GET /general/coupons/available — personalized, advisory shelf for the
   * authenticated customer. Pagination is page/limit (`limit` 1–50);
   * `meta.total` counts only the current page, use `has_more_pages`.
   * Throws `ApiError` on 401/422/network — callers decide how to degrade.
   */
  getAvailableCoupons: async (
    locale: string,
    page: number = 1,
    limit: number = 15,
  ): Promise<{ items: AvailableCoupon[]; meta: PageMeta }> => {
    const params = new URLSearchParams({
      page: String(clampPage(page)),
      limit: String(clampLimit(limit)),
    });
    const response = await apiFetch<ApiResponse<AvailableCouponsData>>(
      `/general/coupons/available?${params.toString()}`,
      { headers: { lang: locale }, cache: "no-store" },
    );
    const data = response.data;
    return {
      items: data.data ?? [],
      meta:
        data.meta ?? {
          current_page: clampPage(page),
          per_page: clampLimit(limit),
          total: (data.data ?? []).length,
          has_more_pages: false,
        },
    };
  },
  getMyCoupons: async (locale: string): Promise<MyCouponsResult> => {
    try {
      const response = await apiFetch<ApiResponse<MyCouponsData>>(
        "/general/coupons/mine",
        { headers: { lang: locale } },
      );
      const claims: CouponClaim[] = response.data.claims ?? [];
      return { success: true, assignments: response.data.assignments ?? [], claims };
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      return {
        success: false,
        message: err?.message,
        status: err?.status,
      };
    }
  },
  getCoupons: async (locale: string, endpoint: string = "/general/coupons"): Promise<Coupon[]> => {
    const response = await apiFetch<ApiResponse<Coupon[]>>(
      endpoint,
      { headers: { lang: locale }, next: { revalidate: CACHE_TTL.STANDARD } },
    );
    return response.data;
  },

  removeCoupon: async (locale: string): Promise<RemoveCouponResult> => {
    try {
      await apiFetch("/general/coupons/apply", {
        method: "DELETE",
        headers: { lang: locale },
      });
      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      return {
        success: false,
        message: err?.message || "Failed to remove coupon",
        status: err?.status,
      };
    }
  },

  applyCoupon: async (code: string, locale: string): Promise<ApplyCouponResponse> => {
    try {
      const response = await apiFetch<ApiResponse<AppliedCoupon>>(
        "/general/coupons/apply",
        {
          method: "POST",
          body: JSON.stringify({ code }),
          headers: { lang: locale },
        },
      );
      return { success: true, data: response.data, message: response.message };
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      return {
        success: false,
        message: err?.message || "Failed to apply coupon",
        status: err?.status,
      };
    }
  },

  claimCoupon: async (couponId: number, locale: string): Promise<ClaimCouponResponse> => {
    try {
      const response = await apiFetch<ApiResponse<CouponClaim>>(
        `/general/coupons/${couponId}/claim`,
        {
          method: "POST",
          headers: { lang: locale },
        },
      );
      return { success: true, data: response.data, message: response.message };
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      return {
        success: false,
        message: err?.message || "Failed to claim coupon",
        status: err?.status,
      };
    }
  },
};
