import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { CheckoutRequest, FastCheckoutRequest, CheckoutResponse, EligiblePromotion } from "../types";

export const checkoutService = {
  processCheckout: async (
    payload: CheckoutRequest,
    lang?: string,
  ): Promise<CheckoutResponse> => {
    const response = await apiFetch<ApiResponse<CheckoutResponse>>("/general/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
    });
    return response.data;
  },

  processFastCheckout: async (
    payload: FastCheckoutRequest,
    lang?: string,
  ): Promise<CheckoutResponse> => {
    const response = await apiFetch<ApiResponse<CheckoutResponse>>("/general/checkout/fast", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
    });
    return response.data;
  },

  getEligiblePromotions: async (
    lang?: string,
  ): Promise<EligiblePromotion[]> => {
    const response = await apiFetch<ApiResponse<{ eligible_promotions: EligiblePromotion[] }>>(
      "/general/checkout/promotions",
      { lang },
    );
    return response.data.eligible_promotions;
  },
};
