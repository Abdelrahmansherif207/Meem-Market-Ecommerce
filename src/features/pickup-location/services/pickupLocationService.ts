import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { PickupLocation } from "../types";

interface GetAllParams {
  limit?: number;
  search?: string;
  default?: boolean;
}

function buildQueryString(params: GetAllParams): string {
  const entries: [string, string][] = [];
  if (params.limit !== undefined) entries.push(["limit", String(params.limit)]);
  if (params.search) entries.push(["search", params.search]);
  if (params.default !== undefined) entries.push(["default", params.default ? "1" : "0"]);
  return entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : "";
}

export const pickupLocationService = {
  getAll: async (lang?: string, params?: GetAllParams): Promise<PickupLocation[]> => {
    const query = buildQueryString(params ?? {});
    const response = await apiFetch<ApiResponse<PickupLocation[]>>(`/general/pickup-locations${query}`, { lang });
    return response.data;
  },

  getById: async (id: number, lang?: string): Promise<PickupLocation> => {
    const response = await apiFetch<ApiResponse<PickupLocation>>(`/general/pickup-locations/${id}`, { lang });
    return response.data;
  },
};
