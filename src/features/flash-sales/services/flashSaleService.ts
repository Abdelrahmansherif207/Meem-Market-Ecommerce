import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import type { FlashSale, FlashSaleDetail, FlashSaleProduct } from "../types";

export const flashSaleService = {
  getFlashSales: async (locale: string): Promise<FlashSale[]> => {
    const response = await apiFetch<ApiResponse<FlashSale[]>>(
      "/general/flash-sales",
      { headers: { lang: locale }, next: { revalidate: CACHE_TTL.STANDARD } },
    );
    return response.data;
  },

  getFlashSale: async (slug: string, locale: string, currency?: string): Promise<FlashSaleDetail> => {
    const response = await apiFetch<ApiResponse<FlashSaleDetail>>(
      `/general/flash-sales/${encodeURIComponent(slug)}`,
      {
        headers: { lang: locale },
        // Price-bearing: always fresh, never Data-Cached.
        cache: "no-store",
        currency,
      },
    );
    return response.data;
  },

  getEndingToday: async (locale: string, currency?: string): Promise<FlashSaleProduct[]> => {
    const response = await apiFetch<ApiResponse<FlashSaleProduct[]>>(
      "/general/flash-sale-products-ending-today",
      {
        headers: { lang: locale },
        cache: "no-store",
        currency,
      },
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  getEndingThisWeek: async (locale: string, currency?: string): Promise<FlashSaleProduct[]> => {
    const response = await apiFetch<ApiResponse<FlashSaleProduct[]>>(
      "/general/flash-sale-products-ending-this-week",
      {
        headers: { lang: locale },
        cache: "no-store",
        currency,
      },
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
