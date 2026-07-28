import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { PickupLocation } from "../types";

export const pickupLocationService = {
  getAll: async (lang?: string): Promise<PickupLocation[]> => {
    const response = await apiFetch<ApiResponse<PickupLocation[]>>("/general/pickup-locations", { lang });
    return response.data;
  },

  getById: async (id: number, lang?: string): Promise<PickupLocation> => {
    const response = await apiFetch<ApiResponse<PickupLocation>>(`/general/pickup-locations/${id}`, { lang });
    return response.data;
  },
};
