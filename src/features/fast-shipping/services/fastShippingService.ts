import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { SiteSettings } from "@/features/settings/types";

export interface FastShippingStatus {
  enabled: boolean;
  available: boolean;
  fee: number;
  duration_minutes: number;
  opens_at: string | null;
  closes_at: string | null;
  available_again_at: string | null;
}

/**
 * NOTE: `GET /general/fast-shipping/status` is outdated and must NOT be used.
 * Fast-shipping state comes from `GET /general/settings` ->
 * `data.options.fast_shipping`. Backend serializes scalars as strings
 * (e.g. `enabled: "1"`, `fee: "0"`), so everything is parsed tolerantly.
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

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

export function getFastShippingStatusFromSettings(
  settings: SiteSettings | null | undefined,
  now: Date = new Date(),
): FastShippingStatus {
  const config = settings?.options?.fast_shipping;
  const enabled = toBooleanFlag(config?.enabled);
  const startHour = config?.start_hour ?? null;
  const endHour = config?.end_hour ?? null;
  const withinWindow = isWithinWindow(
    now.getHours() * 60 + now.getMinutes(),
    parseHourToMinutes(startHour),
    parseHourToMinutes(endHour),
  );
  const available = enabled && withinWindow;

  return {
    enabled,
    available,
    fee: toNumber(config?.fee, 0),
    duration_minutes: toNumber(config?.duration_minutes, 0),
    opens_at: startHour,
    closes_at: endHour,
    available_again_at: enabled && !withinWindow ? startHour : null,
  };
}

export const fastShippingService = {
  getStatus: async (lang = "en"): Promise<FastShippingStatus> => {
    // Intentionally no `next.revalidate` — this service runs client-side.
    const response = await apiFetch<ApiResponse<SiteSettings>>(
      "/general/settings",
      { channel: false, headers: { lang } },
    );
    return getFastShippingStatusFromSettings(response.data);
  },
};
