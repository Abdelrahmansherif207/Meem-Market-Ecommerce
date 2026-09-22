import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import type { Banner, BannerDetail } from "../types";

export const bannerService = {
  getBanners: async (locale: string, limit = 10): Promise<Banner[]> => {
    const response = await apiFetch<ApiResponse<Banner[]>>(
      `/general/banners?limit=${limit}`,
      { headers: { lang: locale }, next: { revalidate: CACHE_TTL.STANDARD } },
    );
    return response.data;
  },

  getBanner: async (slug: string, locale: string, currency?: string): Promise<BannerDetail> => {
    const response = await apiFetch<ApiResponse<BannerDetail>>(
      `/general/banners/${encodeURIComponent(slug)}?with_products=true`,
      {
        headers: { lang: locale },
        // Price-bearing (`with_products=true`): always fresh, never Data-Cached.
        cache: "no-store",
        currency,
      },
    );
    return response.data;
  },
};
