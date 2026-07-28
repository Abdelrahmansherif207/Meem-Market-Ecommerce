import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { NavbarMenu } from "../types";

export const navbarService = {
  getAll: async (lang: string): Promise<NavbarMenu[]> => {
    const response = await apiFetch<ApiResponse<NavbarMenu[]>>(
      "/general/nav-data",
      { lang, next: { revalidate: 300 } },
    );
    return response.data;
  },
};
