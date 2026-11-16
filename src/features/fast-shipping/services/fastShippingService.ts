import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { RawSiteSettings, SiteSettings } from "@/features/settings/types";

export interface FastShippingStatus {
  enabled: boolean;
  available: boolean;
  /** Null when the backend omits the fee (hide it in the UI). */
  fee: number | null;
  /** Null when the backend omits the ETA (hide it in the UI). */
  duration_minutes: number | null;
  opens_at: string | null;
  closes_at: string | null;
  available_again_at: string | null;
}

interface FastShippingConfig {
  enabled?: string | number | boolean | null;
  duration_minutes?: string | number | null;
  fee?: string | number | null;
  start_hour?: string | null;
  end_hour?: string | null;
}

const FAST_SHIPPING_CACHE_TAG = "fast-shipping-status";

/**
 * Fast-shipping state comes primarily from `GET /general/settings` ->
 * `data.options.fast_shipping`. The backend serializes scalars as strings
 * (e.g. `enabled: "1"`, `fee: "0"`), so everything is parsed tolerantly.
 * When the settings block omits fee/ETA/window, the public status endpoint
 * fills only those missing fields.
 */
function toBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "on"
    );
  }
  return false;
}

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseHourToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isWithinWindow(
  nowMinutes: number,
  start: number | null,
  end: number | null,
): boolean {
  // No window configured (or unparseable) — availability follows the flag.
  if (start === null || end === null) return true;
  if (start === end) return true;
  if (start < end) return nowMinutes >= start && nowMinutes < end;
  // Overnight window, e.g. 22:00 -> 02:00.
  return nowMinutes >= start || nowMinutes < end;
}

function parseConfig(
  settings: SiteSettings | null | undefined,
): FastShippingConfig {
  return settings?.options?.fast_shipping ?? {};
}

function isConfigComplete(config: FastShippingConfig): boolean {
  return (
    config.enabled !== null &&
    config.enabled !== undefined &&
    toOptionalNumber(config.fee) !== null &&
    toOptionalNumber(config.duration_minutes) !== null &&
    parseHourToMinutes(config.start_hour) !== null &&
    parseHourToMinutes(config.end_hour) !== null
  );
}

function buildStatus(
  config: FastShippingConfig,
  now: Date,
): FastShippingStatus {
  const enabled = toBooleanFlag(config.enabled);
  const startHour = config.start_hour ?? null;
  const endHour = config.end_hour ?? null;
  const withinWindow = isWithinWindow(
    now.getHours() * 60 + now.getMinutes(),
    parseHourToMinutes(startHour),
    parseHourToMinutes(endHour),
  );
  const available = enabled && withinWindow;

  return {
    enabled,
    available,
    fee: toOptionalNumber(config.fee),
    duration_minutes: toOptionalNumber(config.duration_minutes),
    opens_at: startHour,
    closes_at: endHour,
    available_again_at: enabled && !withinWindow ? startHour : null,
  };
}

export function getFastShippingStatusFromSettings(
  settings: SiteSettings | null | undefined,
  now: Date = new Date(),
): FastShippingStatus {
  return buildStatus(parseConfig(settings), now);
}

async function fetchRemoteStatus(
  lang: string,
): Promise<FastShippingStatus | null> {
  try {
    const response = await apiFetch<ApiResponse<FastShippingStatus>>(
      "/general/fast-shipping/status",
      {
        lang,
        next: {
          revalidate: CACHE_TTL.STANDARD,
          tags: [FAST_SHIPPING_CACHE_TAG],
        },
      },
    );
    return response?.data ?? null;
  } catch {
    return null;
  }
}

async function fetchSettingsConfig(lang: string): Promise<FastShippingConfig> {
  try {
    const response = await apiFetch<ApiResponse<RawSiteSettings>>(
      "/general/settings",
      {
        lang,
        next: { revalidate: CACHE_TTL.STANDARD },
      },
    );
    const options = response?.data?.options;
    if (!options || typeof options !== "object") return {};
    return (options.fast_shipping as FastShippingConfig | undefined) ?? {};
  } catch {
    return {};
  }
}

/**
 * Resolve fast-shipping state with settings as the primary source:
 * `GET /general/settings` -> `data.options.fast_shipping`, then fill missing
 * fee/ETA/window fields from `GET /general/fast-shipping/status`.
 */
export async function resolveFastShippingStatus(
  lang: string,
  settings?: SiteSettings | null,
  now: Date = new Date(),
): Promise<FastShippingStatus> {
  const config = settings
    ? parseConfig(settings)
    : await fetchSettingsConfig(lang);

  if (isConfigComplete(config)) return buildStatus(config, now);

  const remote = await fetchRemoteStatus(lang);

  const merged: FastShippingConfig = {
    enabled:
      config.enabled === null || config.enabled === undefined
        ? (remote?.enabled ?? null)
        : config.enabled,
    fee:
      toOptionalNumber(config.fee) !== null
        ? config.fee
        : (remote?.fee ?? null),
    duration_minutes:
      toOptionalNumber(config.duration_minutes) !== null
        ? config.duration_minutes
        : (remote?.duration_minutes ?? null),
    start_hour:
      parseHourToMinutes(config.start_hour) !== null
        ? config.start_hour
        : (remote?.opens_at ?? null),
    end_hour:
      parseHourToMinutes(config.end_hour) !== null
        ? config.end_hour
        : (remote?.closes_at ?? null),
  };

  return buildStatus(merged, now);
}

export const fastShippingService = {
  getStatus: async (lang = "en"): Promise<FastShippingStatus> => {
    return resolveFastShippingStatus(lang);
  },
};
