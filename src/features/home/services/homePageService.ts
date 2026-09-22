import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";

import type { HomeContentPage } from "../types";

export const homePageService = {
  getHomePage: async (lang?: string): Promise<HomeContentPage> => {
    const response = await apiFetch<ApiResponse<HomeContentPage>>(
      "/general/content-pages/home",
      // CMS-driven page definition: always fresh, never Data-Cached.
      { cache: "no-store", lang },
    );
    return response.data;
  },

  fetchSectionData: async <T>(endpoint: string, lang?: string, currency?: string): Promise<T> => {
    const response = await apiFetch<ApiResponse<T>>(endpoint, {
      // Home is CMS-driven and price-bearing: always fresh, never Data-Cached.
      cache: "no-store",
      currency,
      lang,
    });
    return response.data;
  },
};
