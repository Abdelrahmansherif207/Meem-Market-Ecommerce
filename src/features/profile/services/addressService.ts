import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "../types";

export const addressService = {
  getAll: async (lang?: string): Promise<Address[]> => {
    const response = await apiFetch<ApiResponse<Address[]>>("/address", { lang });
    return response.data;
  },

  create: async (payload: CreateAddressPayload, lang?: string): Promise<Address> => {
    const response = await apiFetch<ApiResponse<Address>>("/address", {
      method: "POST",
      body: JSON.stringify(payload),
      lang,
    });
    return response.data;
  },

  update: async (id: number, payload: UpdateAddressPayload, lang?: string): Promise<Address> => {
    const response = await apiFetch<ApiResponse<Address>>(`/address/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
    });
    return response.data;
  },

  delete: async (id: number, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<null>>(`/address/${id}`, {
      method: "DELETE",
      lang,
    });
  },
};
