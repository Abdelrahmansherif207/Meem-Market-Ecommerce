import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Banner, BannerDetail } from "../types";

export const bannerService = {
  getBanners: async (locale: string, limit = 10): Promise<Banner[]> => {
    const response = await apiFetch<ApiResponse<Banner[]>>(
      `/general/banners?limit=${limit}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getBanner: async (slug: string, locale: string): Promise<BannerDetail> => {
    const response = await apiFetch<ApiResponse<BannerDetail>>(
      `/general/banners/${encodeURIComponent(slug)}?with_products=true`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },
};
