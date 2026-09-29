import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { CheckoutRequest, FastCheckoutRequest, CheckoutResponse, EligiblePromotion, PaymentGatewayOption } from "../types";

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
    const response = await apiFetch<ApiResponse<CheckoutResponse>>("/general/fast-shipping/checkout", {
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

  getPaymentGateways: async (lang?: string): Promise<PaymentGatewayOption[]> => {
    const response = await apiFetch<ApiResponse<{ gateways: PaymentGatewayOption[] }>>(
      "/general/payment-gateways",
      { lang },
    );
    return response.data.gateways ?? [];
  },
};
