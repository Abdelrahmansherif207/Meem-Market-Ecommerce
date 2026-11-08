/**
 * Locale-aware Catch Beauty fallbacks and placeholder guards for
 * `GET /general/settings`.
 *
 * The backend currently returns placeholder copy ("Site Name",
 * "اسم الموقع", …) and example.com URLs until an admin fills the real
 * values. Those values must be treated exactly like empty strings.
 */

export const DEFAULT_SITE_NAME: Record<string, string> = {
  ar: "كاتش بيوتي",
  en: "Catch Beauty",
};

export const DEFAULT_SITE_DESCRIPTION: Record<string, string> = {
  ar: "تسوقي أفضل المنتجات في كاتش بيوتي — الجمال والعناية الشخصية والمزيد في قطر",
  en: "Shop the best products at Catch Beauty — beauty, personal care, and more in Qatar.",
};

export const DEFAULT_SITE_COPYRIGHT: Record<string, string> = {
  ar: "حقوق النشر © 2026 كاتش بيوتي. جميع الحقوق محفوظة",
  en: "Copyright © 2026 Catch Beauty. All rights reserved",
};

export const DEFAULT_LOGO = "/catch-logo.png";
export const DEFAULT_FOOTER_LOGO = "/catch-footer-logo.jpeg";
export const DEFAULT_FAVICON = "/catch-footer-logo.jpeg";

export const DEFAULT_SITE_EMAIL = "cs@catchbeauty.com";
export const DEFAULT_PHONE = "+974 9636 7199";
export const DEFAULT_WHATSAPP_URL = "https://wa.me/97496367199";

/** Text values the API uses as placeholders (compared case-insensitively). */
export const PLACEHOLDER_TEXTS = [
  "site name",
  "site description",
  "site description for search",
  "site copyright",
  "اسم الموقع",
  "وصف الموقع",
  "وصف الموقع للبحث",
  "حقوق الموقع",
] as const;

/**
 * Placeholder URL markers: example.com hosts and `/example` style paths
 * (e.g. `youtube.com/channel/example`, `youtube.com/watch?v=example`).
 */
export const PLACEHOLDER_URL_HOST = /example\.(com|org|net)/i;
export const PLACEHOLDER_URL_PATH = /\/example(?:\/|$|[?#])|\bv=example\b/i;

/** Cache tag used for on-demand revalidation of the settings payload. */
export const SETTINGS_CACHE_TAG = "site-settings";
