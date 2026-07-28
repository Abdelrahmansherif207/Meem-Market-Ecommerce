import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Slider, SliderDetail } from "../types";

export const sliderService = {
  getSliders: async (locale: string, limit = 5): Promise<Slider[]> => {
    const response = await apiFetch<ApiResponse<Slider[]>>(
      `/general/sliders?limit=${limit}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getSlider: async (slug: string, locale: string): Promise<SliderDetail> => {
    const response = await apiFetch<ApiResponse<SliderDetail>>(
      `/general/sliders/${encodeURIComponent(slug)}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },
};
