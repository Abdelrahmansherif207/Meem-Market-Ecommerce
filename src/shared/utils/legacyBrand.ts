/**
 * Legacy-brand guards for stale CMS content.
 *
 * Homepage, settings and footer payloads still carry copy and links authored
 * for the previous brand (Catch Beauty). Render-time sanitising keeps the Meem
 * identity intact without waiting for content editors to replace every field.
 */

const BRAND_NAME: Record<string, string> = {
  ar: "سوق ميم الكويت",
  en: "Meem Market Kuwait",
};

/** "Catch Beauty" in English (with or without a space) and in Arabic. */
const LEGACY_BRAND_NAME = /catch\s*beauty|كاتش\s*بيوتي/gi;

/** Brand handle as it appears in legacy social profile URLs. */
const LEGACY_BRAND_HANDLE = /catch[\s_-]?beauty/i;

/** Absolute URL (scheme or protocol-relative). Media hosts stay untouched. */
const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/** Relative local asset that still carries the retired catch prefix. */
const LEGACY_LOCAL_ASSET = /(^|\/)catch[-_]/i;

/** Replaces the old brand name in CMS copy with the localized Meem name. */
export function sanitizeLegacyBrand(text: string, locale?: string): string {
  if (!text) return text;
  const replacement =
    locale?.toLowerCase().startsWith("ar") ? BRAND_NAME.ar : BRAND_NAME.en;
  return text.replace(LEGACY_BRAND_NAME, replacement);
}

/**
 * True for URLs that still point at the previous brand's social accounts.
 * Deliberately matches the handle in the URL, never the bare backend host
 * (e.g. `catch.mohammedtareq.me`), which is a legitimate media host.
 */
export function isLegacyBrandUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return LEGACY_BRAND_HANDLE.test(url);
}

/**
 * Drops CMS media references to deleted catch assets. Absolute backend URLs
 * are preserved because the current media host still contains "catch".
 */
export function sanitizeLegacyCmsMedia(url: string | null | undefined): string {
  const value = url?.trim() ?? "";
  if (!value) return "";
  if (ABSOLUTE_URL.test(value)) return value;
  return LEGACY_LOCAL_ASSET.test(value) ? "" : value;
}
