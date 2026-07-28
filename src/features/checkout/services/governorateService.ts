import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Governorate } from "../types";

export const governorateService = {
  getAll: async (lang?: string): Promise<Governorate[]> => {
    const response = await apiFetch<ApiResponse<Governorate[]>>(
      "/general/governorates",
      { lang },
    );
    return response.data;
  },
};
