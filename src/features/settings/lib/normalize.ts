import { normalizeCurrencyCode } from "@/shared/lib/currency";
import {
  DEFAULT_FAVICON,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_LOGO,
  DEFAULT_PHONE,
  DEFAULT_SITE_COPYRIGHT,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_EMAIL,
  DEFAULT_SITE_NAME,
  DEFAULT_WHATSAPP_URL,
  PLACEHOLDER_TEXTS,
  PLACEHOLDER_URL_HOST,
  PLACEHOLDER_URL_PATH,
} from "../constants";
import type {
  PaymentGatewayState,
  RawPaymentGateways,
  RawSiteSettings,
  RawSiteSettingsOptions,
  SiteSettings,
} from "../types";

const PLACEHOLDER_TEXT_SET = new Set<string>(PLACEHOLDER_TEXTS);

/** Coerce the API's boolean-ish flags (`true`, `1`, `"1"`, `"true"`). */
export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }
  return false;
}

/** Coerce numeric strings (e.g. `"50.00"`); invalid values use `fallback`. */
export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Trim text and treat API placeholder copy as missing. This is what keeps
 * "Site Name" / "اسم الموقع" out of the storefront.
 */
export function cleanSettingsText(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
  return PLACEHOLDER_TEXT_SET.has(normalized) ? "" : trimmed;
}

/**
 * Validate image/social/video URLs. Relative paths are only allowed for
 * local assets (logos, favicons). Placeholder hosts and `/example` paths are
 * rejected.
 */
export function cleanSettingsUrl(value: unknown, allowRelative = false): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") return "";
  if (PLACEHOLDER_URL_HOST.test(trimmed) || PLACEHOLDER_URL_PATH.test(trimmed)) {
    return "";
  }
  if (trimmed.startsWith("//")) return "";
  if (allowRelative && trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return trimmed;
  } catch {
    return "";
  }
}

export function cleanSettingsEmail(value: unknown): string {
  const trimmed = cleanSettingsText(value);
  if (!trimmed || PLACEHOLDER_URL_HOST.test(trimmed)) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}

/**
 * Treat placeholder phone numbers (e.g. `+2011111111111`, a run of ones)
 * as missing. Real numbers are returned verbatim so the displayed format is
 * preserved.
 */
export function cleanSettingsPhone(value: unknown): string {
  const trimmed = cleanSettingsText(value);
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 6) return "";
  if (/1{7,}/.test(digits)) return "";
  return trimmed;
}

/** Derive a wa.me link from any phone display format. */
export function buildWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : DEFAULT_WHATSAPP_URL;
}

function normalizeGateways(value: RawPaymentGateways | null | undefined): Record<string, PaymentGatewayState> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, PaymentGatewayState> = {};
  for (const [rawCode, state] of Object.entries(value)) {
    const code = rawCode.trim().toLowerCase();
    if (!code) continue;
    if (state && typeof state === "object") {
      result[code] = {
        enabled: toBoolean(state.enabled),
        available: toBoolean(state.available),
      };
    }
  }
  return result;
}

export interface LocaleSettingsDefaults {
  siteName: string;
  description: string;
  copyright: string;
}

export function getLocaleSettingsDefaults(locale: string): LocaleSettingsDefaults {
  return {
    siteName: DEFAULT_SITE_NAME[locale] ?? DEFAULT_SITE_NAME.en,
    description: DEFAULT_SITE_DESCRIPTION[locale] ?? DEFAULT_SITE_DESCRIPTION.en,
    copyright: DEFAULT_SITE_COPYRIGHT[locale] ?? DEFAULT_SITE_COPYRIGHT.en,
  };
}

/**
 * Merge the raw API payload over locale-aware defaults.
 *
 * Fallback chains:
 * - `site_name`    → locale default
 * - `site_desc`    → locale default
 * - `meta_desc`    → resolved `site_desc` → locale default
 * - `site_copy_right` → locale default
 * - `logo`         → `/raowdalaseel-logo.png`
 * - `footer_logo`  → raw `logo` → `/raowdalaseel-logo.png`
 * - `favicon`      → `/raowdalaseel-logo.png`
 * - contact/social → Rawd Al-Aseel contact defaults; invalid URLs become `""`
 */
export function normalizeSiteSettings(raw: unknown, locale: string): SiteSettings {
  const data: RawSiteSettings =
    raw && typeof raw === "object" ? (raw as RawSiteSettings) : {};
  const defaults = getLocaleSettingsDefaults(locale);

  const siteName = cleanSettingsText(data.site_name) || defaults.siteName;
  const siteDesc = cleanSettingsText(data.site_desc) || defaults.description;
  const metaDesc = cleanSettingsText(data.meta_desc) || siteDesc;
  const copyright = cleanSettingsText(data.site_copy_right) || defaults.copyright;

  const rawLogo = cleanSettingsUrl(data.logo, true);
  const logo = rawLogo || DEFAULT_LOGO;
  const footerLogo =
    cleanSettingsUrl(data.footer_logo, true) || rawLogo || DEFAULT_FOOTER_LOGO;
  const favicon = cleanSettingsUrl(data.favicon, true) || DEFAULT_FAVICON;

  const siteEmail = cleanSettingsEmail(data.site_email) || DEFAULT_SITE_EMAIL;
  const supportEmail = cleanSettingsEmail(data.email_support) || siteEmail;
  const phone = cleanSettingsPhone(data.phone) || DEFAULT_PHONE;

  const rawOptions: RawSiteSettingsOptions =
    data.options && typeof data.options === "object" ? data.options : {};

  const currency = normalizeCurrencyCode(rawOptions.currency);
  const baseCurrency = normalizeCurrencyCode(rawOptions.base_currency_code);
  const catalogCurrency = normalizeCurrencyCode(rawOptions.catalog_currency_code);
  const currencySelectionEnabled =
    toBoolean(rawOptions.currency_selection_enabled) ||
    toBoolean(data.currency_selection_enabled);

  return {
    site_name: siteName,
    site_desc: siteDesc,
    meta_desc: metaDesc,
    site_copy_right: copyright,
    logo,
    footer_logo: footerLogo,
    favicon,
    site_email: siteEmail,
    email_support: supportEmail,
    facebook: cleanSettingsUrl(data.facebook),
    instagram: cleanSettingsUrl(data.instagram),
    linkedin: cleanSettingsUrl(data.linkedin),
    promotion_video_url: cleanSettingsUrl(data.promotion_video_url),
    youtube: cleanSettingsUrl(data.youtube),
    tiktok: cleanSettingsUrl(data.tiktok),
    snapchat: cleanSettingsUrl(data.snapchat),
    phone,
    fast_shipping_page_publish: toBoolean(data.fast_shipping_page_publish),
    minimumOrderAmount: toNumber(data.minimumOrderAmount, 0),
    order_tax_enabled: toBoolean(data.order_tax_enabled),
    order_tax_rate: toNullableNumber(data.order_tax_rate),
    currency_selection_enabled: currencySelectionEnabled,
    payment_gateways: normalizeGateways(data.payment_gateways),
    options: {
      currency: currency ?? baseCurrency ?? catalogCurrency,
      base_currency_code: baseCurrency,
      catalog_currency_code: catalogCurrency,
      currency_selection_enabled: currencySelectionEnabled,
    },
  };
}
