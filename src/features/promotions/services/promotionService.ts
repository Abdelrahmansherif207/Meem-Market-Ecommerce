import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Promotion, PromotionDetail } from "../types";

export const promotionService = {
  getPromotions: async (locale: string, limit = 10): Promise<Promotion[]> => {
    const response = await apiFetch<ApiResponse<Promotion[]>>(
      `/general/promotions?limit=${limit}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getPromotion: async (slug: string, locale: string): Promise<PromotionDetail> => {
    const response = await apiFetch<ApiResponse<PromotionDetail>>(
      `/general/promotions/${encodeURIComponent(slug)}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },
};
