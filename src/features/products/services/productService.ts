import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { ProductDetail, ProductSearchResult } from "../types";

export const productService = {
  getProductBySlug: async (slug: string, lang?: string, currency?: string): Promise<ProductDetail> => {
    const response = await apiFetch<ApiResponse<ProductDetail>>(
      `/general/products/${encodeURIComponent(slug)}`,
      {
        // Price-bearing: always fresh, never Data-Cached.
        cache: "no-store",
        currency,
        lang,
      },
    );
    return response.data;
  },

  searchProducts: async (query: string, lang?: string): Promise<ProductSearchResult[]> => {
    const response = await apiFetch<ApiResponse<{ data: ProductSearchResult[] }>>(
      `/general/products?search=${encodeURIComponent(query)}&per_page=5`,
      { lang },
    );
    return response.data.data;
  },
};
