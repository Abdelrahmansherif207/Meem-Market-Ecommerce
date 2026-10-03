import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { OrderFlowDefinition, ShippingType } from "../types";

export const orderFlowService = {
  /**
   * Fetches the order-flow definition (statuses + dynamic inputs) for the
   * selected shipping type. Auth is attached by the api proxy from the
   * httpOnly session cookie. 422 responses carry "not supported" /
   * "not available" messages the caller must translate into fallbacks.
   */
  getByShippingType: async (
    shippingType: ShippingType,
    lang?: string,
  ): Promise<OrderFlowDefinition> => {
    const response = await apiFetch<ApiResponse<OrderFlowDefinition>>(
      `/general/order-flows/by-shipping-type/${shippingType}`,
      { lang },
    );
    return response.data;
  },
};
