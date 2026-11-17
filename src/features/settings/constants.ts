/**
 * Locale-aware Meem Market Kuwait fallbacks and placeholder guards for
 * `GET /general/settings`.
 *
 * The backend currently returns placeholder copy ("Site Name",
 * "اسم الموقع", …) and example.com URLs until an admin fills the real
 * values. Those values must be treated exactly like empty strings.
 *
 * Settings are backend-first: the primary source is `PUT /api/v1/settings`
 * (admin) and `GET /api/v1/general/settings` (storefront). The values below
 * only cover a missing, placeholder, or unreachable API.
 */

export const DEFAULT_SITE_NAME: Record<string, string> = {
  ar: "سوق ميم الكويت",
  en: "Meem Market Kuwait",
};

export const DEFAULT_SITE_DESCRIPTION: Record<string, string> = {
  ar: "تسوق البقالة ومستلزمات المنزل والإلكترونيات والألعاب والأزياء والمزيد في سوق ميم الكويت — قيمة يومية وتوصيل سريع في جميع مناطق الكويت",
  en: "Shop groceries, home essentials, electronics, toys, fashion, and more at Meem Market Kuwait — everyday value with fast delivery across Kuwait.",
};

export const DEFAULT_SITE_COPYRIGHT: Record<string, string> = {
  ar: "حقوق النشر © 2026 سوق ميم الكويت. جميع الحقوق محفوظة",
  en: "Copyright © 2026 Meem Market Kuwait. All rights reserved",
};

export const DEFAULT_LOGO = "/meem-new.png";
export const DEFAULT_FOOTER_LOGO = "/new-footer-logo.png";
export const DEFAULT_FAVICON = "/meem-icon.jpeg";

export const DEFAULT_SITE_EMAIL = "admin@meem.market";
export const DEFAULT_PHONE = "22281130";
export const DEFAULT_COUNTRY_CODE = "965";
export const DEFAULT_WHATSAPP_URL = "https://wa.me/96522281130";

/**
 * Kuwait branch social accounts. Used only when the backend returns no valid
 * social URL at all. As soon as one valid backend URL exists, only backend
 * values are rendered (no per-platform mixing with these defaults).
 */
export const DEFAULT_SOCIAL_LINKS = [
  {
    platform: "instagram",
    url: "https://www.instagram.com/meemmarketkw",
    label: "Instagram",
  },
  {
    platform: "facebook",
    url: "https://www.facebook.com/meemmarketkw1",
    label: "Facebook",
  },
  {
    platform: "tiktok",
    url: "https://www.tiktok.com/@meemmarketkw",
    label: "TikTok",
  },
  {
    platform: "snapchat",
    url: "https://www.snapchat.com/@meemmarketkw",
    label: "Snapchat",
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/@meemmarket6493",
    label: "YouTube",
  },
  {
    platform: "whatsapp",
    url: "https://wa.me/96522281130",
    label: "WhatsApp",
  },
] as const;

export type DefaultSocialLink = (typeof DEFAULT_SOCIAL_LINKS)[number];

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
