/**
 * Locale-aware Meem Market Riyadh fallbacks and placeholder guards for
 * `GET /general/settings`.
 *
 * The backend currently returns placeholder copy ("Site Name",
 * "اسم الموقع", …) and example.com URLs until an admin fills the real
 * values. Those values must be treated exactly like empty strings.
 */

export const DEFAULT_SITE_NAME: Record<string, string> = {
  ar: "سوق ميم الرياض",
  en: "Meem Market Riyadh",
};

export const DEFAULT_SITE_DESCRIPTION: Record<string, string> = {
  ar: "تسوق أفضل المنتجات في سوق ميم الرياض — الجمال والعناية الشخصية والإلكترونيات والأزياء ومنتجات المنزل والمزيد في الرياض",
  en: "Shop the best products at Meem Market Riyadh — beauty, personal care, electronics, fashion, home goods, and more in Riyadh.",
};

export const DEFAULT_SITE_COPYRIGHT: Record<string, string> = {
  ar: "حقوق النشر © 2026 سوق ميم الرياض. جميع الحقوق محفوظة",
  en: "Copyright © 2026 Meem Market Riyadh. All rights reserved",
};

export const DEFAULT_LOGO = "/meem-new.png";
export const DEFAULT_FOOTER_LOGO = "/new-footer-logo.png";
export const DEFAULT_FAVICON = "/meem-icon.jpeg";

export const DEFAULT_SITE_EMAIL = "info@meemmarket.com";
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

/** Cache tag used for the storefront font payload (`GET /public/font`). */
export const FONT_CACHE_TAG = "font";
