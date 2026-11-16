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
  FastShippingOptions,
  PaymentGatewaySettings,
  PaymentGatewayState,
  RawPaymentGatewayOptions,
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

/**
 * Derive a wa.me link from any phone display format. Local Saudi numbers
 * (`05...`) and international `00` prefixes are normalized so the link always
 * includes the country code.
 */
export function buildWhatsAppUrl(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_URL;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("9660")) digits = `966${digits.slice(4)}`;
  else if (digits.startsWith("0")) digits = `966${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

/**
 * Preserve the raw fast-shipping block (scalars may be strings). The
 * fast-shipping feature parses it tolerantly so availability logic has a
 * single source of truth.
 */
export function normalizeFastShippingOptions(
  value: unknown,
): FastShippingOptions | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const text = (key: string): string | null => {
    const entry = raw[key];
    return entry === null || entry === undefined ? null : String(entry);
  };
  return {
    enabled:
      raw.enabled === null || raw.enabled === undefined
        ? null
        : (raw.enabled as string | number | boolean),
    duration_minutes:
      raw.duration_minutes === null || raw.duration_minutes === undefined
        ? null
        : (raw.duration_minutes as string | number),
    fee:
      raw.fee === null || raw.fee === undefined
        ? null
        : (raw.fee as string | number),
    start_hour: text("start_hour"),
    end_hour: text("end_hour"),
  };
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

/**
 * Normalize `options.payment_gateways` into a sorted display list. When the
 * backend omits the block entirely, derive it from the top-level gateway map
 * so the footer still shows settings-driven badges. A present-but-empty block
 * stays `[]` (backend says there are no gateways) and never falls back.
 */
function normalizePaymentGatewayOptions(
  value: RawPaymentGatewayOptions | null | undefined,
  states: Record<string, PaymentGatewayState>,
): PaymentGatewaySettings[] | null {
  if (!value || typeof value !== "object") {
    const codes = Object.keys(states);
    if (codes.length === 0) return null;
    return codes.map((code, index) => ({
      code,
      display_name: code,
      enabled: states[code].enabled,
      sort_order: index,
    }));
  }

  const result: PaymentGatewaySettings[] = [];
  for (const [rawCode, option] of Object.entries(value)) {
    const code = rawCode.trim().toLowerCase();
    if (!code) continue;
    const entry: RawPaymentGatewayOptions[string] =
      option && typeof option === "object" ? option : {};
    result.push({
      code,
      display_name: cleanSettingsText(entry.display_name) || code,
      enabled:
        entry.enabled === null || entry.enabled === undefined
          ? Boolean(states[code]?.enabled)
          : toBoolean(entry.enabled),
      sort_order: toNumber(entry.sort_order, Number.MAX_SAFE_INTEGER),
    });
  }

  return result.sort(
    (a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code),
  );
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
 * - `logo`         → `/meem-new.png`
 * - `footer_logo`  → raw `logo` → `/new-footer-logo.png`
 * - `favicon`      → `/new-footer-logo.png`
 * - contact/social → Meem Market Riyadh contact defaults; invalid URLs become `""`
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

  const paymentGateways = normalizeGateways(data.payment_gateways);
  const paymentGatewayOptions = normalizePaymentGatewayOptions(
    rawOptions.payment_gateways,
    paymentGateways,
  );

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
    payment_gateways: paymentGateways,
    options: {
      currency: currency ?? baseCurrency ?? catalogCurrency,
      base_currency_code: baseCurrency,
      catalog_currency_code: catalogCurrency,
      fast_shipping: normalizeFastShippingOptions(rawOptions.fast_shipping),
      payment_gateways: paymentGatewayOptions,
      currency_selection_enabled: currencySelectionEnabled,
    },
  };
}
