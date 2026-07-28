import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { HomeContentPage } from "@/features/home/types";

export const pageService = {
  getBySlug: async (slug: string, lang?: string): Promise<HomeContentPage> => {
    const response = await apiFetch<ApiResponse<HomeContentPage>>(
      `/general/pages/${slug}`,
      { next: { revalidate: 60 }, lang },
    );
    return response.data;
  },
};
