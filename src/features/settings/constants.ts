/**
 * Locale-aware Rawd Al-Aseel fallbacks and placeholder guards for
 * `GET /general/settings`.
 *
 * The backend currently returns placeholder copy ("Site Name",
 * "اسم الموقع", …) and example.com URLs until an admin fills the real
 * values. Those values must be treated exactly like empty strings.
 */

export const DEFAULT_SITE_NAME: Record<string, string> = {
  ar: "روض الأصيل",
  en: "Rawd Al-Aseel",
};

export const DEFAULT_SITE_DESCRIPTION: Record<string, string> = {
  ar: "تسوّق أفضل المنتجات من روض الأصيل — جودة مضمونة بمعايير الصناعة السعودية، مع حلول تعبئة وتغليف وإنتاج متكاملة",
  en: "Shop the best products at Rawd Al-Aseel — quality guaranteed to Saudi industrial standards, backed by integrated packaging and production solutions.",
};

export const DEFAULT_SITE_COPYRIGHT: Record<string, string> = {
  ar: "حقوق النشر © 2026 روض الأصيل. جميع الحقوق محفوظة",
  en: "Copyright © 2026 Rawd Al-Aseel. All rights reserved",
};

export const DEFAULT_LOGO = "/raowdalaseel-logo.png";
export const DEFAULT_FOOTER_LOGO = "/raowdalaseel-logo.png";
export const DEFAULT_FAVICON = "/raowdalaseel-logo.png";

// TODO: replace with official Rawd Al-Aseel contact details when available.
export const DEFAULT_SITE_EMAIL = "info@raowdalaseel.com";
export const DEFAULT_PHONE = "+966 55 000 0000";
export const DEFAULT_WHATSAPP_URL = "https://wa.me/966550000000";

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
