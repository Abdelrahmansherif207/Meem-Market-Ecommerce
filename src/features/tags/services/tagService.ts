import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import type { Tag } from "../types";

export const tagService = {
  getTags: async (lang?: string): Promise<Tag[]> => {
    const response = await apiFetch<ApiResponse<Tag[]>>("/general/tags", {
      next: { revalidate: CACHE_TTL.STANDARD },
      lang,
    });
    return response.data;
  },

  getTagsByEndpoint: async (endpoint: string, lang?: string): Promise<Tag[]> => {
    const response = await apiFetch<ApiResponse<Tag[]>>(endpoint, {
      next: { revalidate: CACHE_TTL.STANDARD },
      lang,
    });
    return response.data;
  },

  getTagBySlug: async (slug: string, lang?: string): Promise<Tag> => {
    const response = await apiFetch<ApiResponse<Tag[]>>(
      `/general/tags?slugs=${encodeURIComponent(slug)}`,
      { next: { revalidate: CACHE_TTL.STANDARD }, lang },
    );
    const tag = response.data?.[0];
    if (!tag) {
      throw new Error(`Tag not found: ${slug}`);
    }
    return tag;
  },
};
