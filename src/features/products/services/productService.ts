import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type { ProductDetail, ProductListItem, ProductSearchResult } from "../types";

export const productService = {
  getProductBySlug: async (slug: string, lang?: string): Promise<ProductDetail> => {
    const response = await apiFetch<ApiResponse<ProductDetail>>(
      `/general/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 }, lang },
    );
    return response.data;
  },

  getProductsByIds: async (ids: number[], lang?: string): Promise<ProductListItem[]> => {
    if (ids.length === 0) return [];
    const response = await apiFetch<ApiResponse<PaginatedData<ProductListItem>>>(
      `/general/products?productsId=${ids.join(",")}`,
      { next: { revalidate: 60 }, lang },
    );
    return response.data.data;
  },

  searchProducts: async (query: string, lang?: string): Promise<ProductSearchResult[]> => {
    const response = await apiFetch<ApiResponse<PaginatedData<ProductSearchResult>>>(
      `/general/products?search=${encodeURIComponent(query)}&per_page=5`,
      { lang },
    );
    return response.data.data;
  },
};
