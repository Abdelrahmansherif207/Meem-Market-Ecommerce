import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type { Order } from "../types";

export const orderService = {
  getAll: async (lang?: string): Promise<PaginatedData<Order>> => {
    const response = await apiFetch<ApiResponse<PaginatedData<Order>>>("/general/orders", { lang });
    return response.data;
  },
};
