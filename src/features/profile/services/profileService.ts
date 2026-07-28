import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { Profile } from "../types";

export const profileService = {
  getProfile: async (lang?: string): Promise<Profile> => {
    const response = await apiFetch<ApiResponse<Profile>>("/me", { lang });
    return response.data;
  },
};
