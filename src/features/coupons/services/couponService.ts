import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Coupon, ApplyCouponResponse, AppliedCoupon } from "../types";

export type RemoveCouponResult =
  | { success: true }
  | { success: false; message: string; status?: number };

export const couponService = {
  getCoupons: async (locale: string): Promise<Coupon[]> => {
    const response = await apiFetch<ApiResponse<Coupon[]>>(
      "/general/coupons",
      { headers: { lang: locale }, next: { revalidate: 60 } },
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
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to remove coupon",
        status: error?.status,
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
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to apply coupon",
        status: error?.status,
      };
    }
  },
};
