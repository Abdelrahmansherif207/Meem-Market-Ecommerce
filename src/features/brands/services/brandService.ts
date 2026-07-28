import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Brand, BrandDetail } from "../types";

export const brandService = {
  getBrands: async (locale: string, limit?: number): Promise<Brand[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const response = await apiFetch<ApiResponse<Brand[]>>(
      `/general/brands${params}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },

  getBrand: async (slug: string, locale: string): Promise<BrandDetail> => {
    const response = await apiFetch<ApiResponse<BrandDetail>>(
      `/general/brands/${encodeURIComponent(slug)}`,
      { headers: { lang: locale }, next: { revalidate: 60 } },
    );
    return response.data;
  },
};

export const getCachedBrands = cache(brandService.getBrands);
