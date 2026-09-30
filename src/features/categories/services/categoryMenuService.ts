import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";

import type { CategoryMenuItem } from "../types";

export const categoryMenuService = {
  getMenu: async (lang: string, level: number = 3): Promise<CategoryMenuItem[]> => {
    const response = await apiFetch<ApiResponse<CategoryMenuItem[]>>(
      `/general/nav-data?level=${level}`,
      { lang, next: { revalidate: CACHE_TTL.NAV } },
    );
    return response.data;
  },
};

