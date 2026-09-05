import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type { Order, OrderDetail } from "../types";

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const orderService = {
  getAll: async (params?: OrderQueryParams, lang?: string): Promise<PaginatedData<Order>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    const response = await apiFetch<ApiResponse<PaginatedData<Order>>>(
      `/general/orders${qs ? `?${qs}` : ""}`,
      { lang },
    );
    return response.data;
  },

  getById: async (id: number, lang?: string): Promise<OrderDetail> => {
    const response = await apiFetch<ApiResponse<OrderDetail>>(
      `/general/orders/${id}`,
      { lang },
    );
    return response.data;
  },
};
