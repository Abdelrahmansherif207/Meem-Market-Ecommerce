import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";

import type { CategoryMenuItem } from "../types";

export const categoryMenuService = {
  getMenu: async (lang: string, level: number = 3): Promise<CategoryMenuItem[]> => {
    const response = await apiFetch<ApiResponse<CategoryMenuItem[]>>(
      `/general/nav-data?level=${level}`,
      { lang, next: { revalidate: 300 } },
    );
    return response.data;
  },
};

