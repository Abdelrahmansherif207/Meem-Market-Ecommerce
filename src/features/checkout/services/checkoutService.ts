import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type {
  CheckoutRequest,
  CheckoutResponse,
  EligiblePromotion,
  FastCheckoutRequest,
  PaymentGatewayOption,
} from "../types";

export const checkoutService = {
  /** Scheduled order. Scoped to the scheduled cart group. */
  processCheckout: async (
    payload: CheckoutRequest,
    lang?: string,
  ): Promise<CheckoutResponse> => {
    const response = await apiFetch<ApiResponse<CheckoutResponse>>("/general/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
      channel: "home",
    });
    return response.data;
  },

  /**
   * NOW order. The backend processes only FAST cart items, leaves scheduled
   * items untouched, and returns the payment gateway URL. Coupons/promotions
   * must not be claimed here.
   */
  processFastCheckout: async (
    payload: FastCheckoutRequest,
    lang?: string,
  ): Promise<CheckoutResponse> => {
    const response = await apiFetch<ApiResponse<CheckoutResponse>>(
      "/general/checkout/fast",
      {
        method: "POST",
        body: JSON.stringify(payload),
        lang,
        channel: "fast-shipping",
      },
    );
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
    return response.data.gateways;
  },
};
