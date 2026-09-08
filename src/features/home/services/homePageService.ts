import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";

import type { HomeContentPage } from "../types";

export const homePageService = {
  getHomePage: async (lang?: string): Promise<HomeContentPage> => {
    const response = await apiFetch<ApiResponse<HomeContentPage>>(
      "/general/content-pages/home",
      { next: { revalidate: 60 }, lang },
    );
    return response.data;
  },

  fetchSectionData: async <T>(endpoint: string, lang?: string, currency?: string): Promise<T> => {
    const response = await apiFetch<ApiResponse<T>>(endpoint, {
      // Currency-converted prices are per-guest: never share them through
      // the Data Cache (fetch cache key does not vary by header).
      ...(currency ? { cache: "no-store" as RequestCache, currency } : { next: { revalidate: 60 } }),
      lang,
    });
    return response.data;
  },
};
