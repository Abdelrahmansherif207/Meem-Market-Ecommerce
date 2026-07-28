import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { SiteSettings } from "../types";

async function fetchSettings(locale: string): Promise<SiteSettings> {
  const response = await apiFetch<ApiResponse<SiteSettings>>(
    "/general/settings",
    { headers: { lang: locale }, next: { revalidate: 300 } },
  );
  return response.data;
}

export const getCachedSettings = cache(fetchSettings);

export const settingsService = {
  getSettings: fetchSettings,
};
