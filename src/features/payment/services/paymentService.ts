import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { CheckoutRequest, CheckoutResponse } from "../types";

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
};
