import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { FlashSale, FlashSaleDetail, FlashSaleProduct } from "../types";

export const flashSaleService = {
  getFlashSales: async (locale: string): Promise<FlashSale[]> => {
    const response = await apiFetch<ApiResponse<FlashSale[]>>(
      "/general/flash-sales",
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getFlashSale: async (slug: string, locale: string): Promise<FlashSaleDetail> => {
    const response = await apiFetch<ApiResponse<FlashSaleDetail>>(
      `/general/flash-sales/${encodeURIComponent(slug)}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getEndingToday: async (locale: string): Promise<FlashSaleProduct[]> => {
    const response = await apiFetch<ApiResponse<FlashSaleProduct[]>>(
      "/general/flash-sale-products-ending-today",
      { headers: { lang: locale }, next: { revalidate: 30 } },
    );
    return response.data;
  },

  getEndingThisWeek: async (locale: string): Promise<FlashSaleProduct[]> => {
    const response = await apiFetch<ApiResponse<FlashSaleProduct[]>>(
      "/general/flash-sale-products-ending-this-week",
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },
};
