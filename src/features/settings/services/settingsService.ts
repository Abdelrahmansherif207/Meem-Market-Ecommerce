import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import { SETTINGS_CACHE_TAG } from "../constants";
import { normalizeSiteSettings } from "../lib/normalize";
import type { RawSiteSettings, SiteSettings } from "../types";

/**
 * `GET /general/settings` — the single source for storefront identity,
 * contact/social links and commerce flags.
 *
 * The payload is normalized over locale-aware Rawd Al-Aseel defaults, and a
 * failed request returns those defaults instead of throwing so the layout
 * can render without extra fallback logic. Concurrent calls within one
 * request are deduplicated by React `cache()`.
 */
async function fetchSettings(locale: string): Promise<SiteSettings> {
  try {
    const response = await apiFetch<ApiResponse<RawSiteSettings>>(
      "/general/settings",
      {
        lang: locale,
        next: {
          revalidate: CACHE_TTL.STANDARD,
          tags: [SETTINGS_CACHE_TAG],
        },
      },
    );

    if (!response || response.success === false || !response.data) {
      return normalizeSiteSettings(null, locale);
    }

    return normalizeSiteSettings(response.data, locale);
  } catch (error) {
    console.warn("[settings] Falling back to Rawd Al-Aseel defaults", error);
    return normalizeSiteSettings(null, locale);
  }
}

export const getCachedSettings = cache(fetchSettings);

export const settingsService = {
  getSettings: fetchSettings,
};
