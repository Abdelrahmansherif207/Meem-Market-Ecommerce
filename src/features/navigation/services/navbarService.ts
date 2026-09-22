import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import type { NavbarMenu } from "../types";

export const navbarService = {
  getAll: async (lang: string): Promise<NavbarMenu[]> => {
    const response = await apiFetch<ApiResponse<NavbarMenu[]>>(
      "/general/nav-data",
      { lang, next: { revalidate: CACHE_TTL.NAV } },
    );
    return response.data;
  },
};
