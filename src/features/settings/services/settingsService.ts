import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { SiteSettings } from "../types";

async function fetchSettings(locale: string): Promise<SiteSettings> {
  const response = await apiFetch<ApiResponse<SiteSettings>>(
    "/general/settings",
    { headers: { lang: locale }, next: { revalidate: 300 } },
  );
  const data = response.data;
  return {
    ...data,
    // Backend serializes this as a string (e.g. "50.00") — coerce to number
    // so numeric comparisons (minimum-order gates, progress bars) behave.
    minimumOrderAmount: Number(data.minimumOrderAmount) || 0,
  };
}

export const getCachedSettings = cache(fetchSettings);

export const settingsService = {
  getSettings: fetchSettings,
};
