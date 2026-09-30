import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import type { Slider, SliderDetail } from "../types";

export const sliderService = {
  getSliders: async (locale: string, limit = 5): Promise<Slider[]> => {
    const response = await apiFetch<ApiResponse<Slider[]>>(
      `/general/sliders?limit=${limit}`,
      { headers: { lang: locale }, next: { revalidate: CACHE_TTL.STANDARD } },
    );
    return response.data;
  },

  getSlider: async (slug: string, locale: string, currency?: string): Promise<SliderDetail> => {
    const response = await apiFetch<ApiResponse<SliderDetail>>(
      `/general/sliders/${encodeURIComponent(slug)}`,
      {
        headers: { lang: locale },
        // Price-bearing: always fresh, never Data-Cached.
        cache: "no-store",
        currency,
      },
    );
    return response.data;
  },
};
