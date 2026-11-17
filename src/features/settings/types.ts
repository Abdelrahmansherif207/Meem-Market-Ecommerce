/**
 * Site settings payloads from `GET /general/settings`.
 *
 * The backend serializes every text field as a string, nullable fields as
 * `null`, and boolean flags either as booleans or as `0` / `1`. The raw
 * shape below mirrors the wire contract; `SiteSettings` is the normalized
 * shape the storefront consumes (no nulls, locale-aware defaults applied).
 */

export interface RawPaymentGatewayState {
  enabled?: boolean | number | string | null;
  available?: boolean | number | string | null;
}

export type RawPaymentGateways = Record<string, RawPaymentGatewayState>;

/** Admin `options.payment_gateways` entry (display metadata + toggle). */
export interface RawPaymentGatewayOption {
  enabled?: boolean | number | string | null;
  display_name?: string | null;
  sort_order?: string | number | null;
}

export type RawPaymentGatewayOptions = Record<string, RawPaymentGatewayOption>;

export interface RawSiteSettingsOptions {
  currency?: string | null;
  base_currency_code?: string | null;
  catalog_currency_code?: string | null;
  currency_selection_enabled?: boolean | number | string | null;
  payment_gateways?: RawPaymentGatewayOptions | null;
  [key: string]: unknown;
}

export interface RawSiteSettings {
  site_name?: string | null;
  site_desc?: string | null;
  meta_desc?: string | null;
  site_copy_right?: string | null;
  logo?: string | null;
  footer_logo?: string | null;
  favicon?: string | null;
  site_email?: string | null;
  email_support?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  promotion_video_url?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  phone?: string | null;
  fast_shipping_page_publish?: boolean | number | string | null;
  minimumOrderAmount?: string | number | null;
  order_tax_enabled?: boolean | number | string | null;
  order_tax_rate?: string | number | null;
  currency_selection_enabled?: boolean | number | string | null;
  payment_gateways?: RawPaymentGateways | null;
  options?: RawSiteSettingsOptions | null;
}

export interface PaymentGatewayState {
  enabled: boolean;
  available: boolean;
}

/** Normalized gateway option from `options.payment_gateways`, sorted for UI. */
export interface PaymentGatewaySettings {
  code: string;
  display_name: string;
  enabled: boolean;
  sort_order: number;
}

/**
 * Raw `options.fast_shipping` block from `GET /general/settings`. The backend
 * serializes scalars as strings (e.g. `enabled: "1"`, `fee: "0"`), so every
 * field stays tolerant and is parsed by the fast-shipping feature.
 */
export interface FastShippingOptions {
  enabled?: string | number | boolean | null;
  duration_minutes?: string | number | null;
  fee?: string | number | null;
  start_hour?: string | null;
  end_hour?: string | null;
}

export interface SiteSettingsOptions {
  currency?: string;
  base_currency_code?: string;
  catalog_currency_code?: string;
  /** Fast (NOW) delivery availability/fee/window. */
  fast_shipping?: FastShippingOptions | null;
  /** Admin-ordered gateway display metadata; `null` when the backend omits it. */
  payment_gateways: PaymentGatewaySettings[] | null;
  currency_selection_enabled: boolean;
}

/**
 * Admin-uploaded storefront font from `GET /public/font`. At most one custom
 * family is configured at a time; `null` data means the built-in font.
 */
export type CustomFontSourceType = "file" | "link";

/** CSS `format()` identifiers accepted for uploaded font files. */
export type CustomFontFormat = "woff2" | "woff" | "truetype" | "opentype";

export interface RawCustomFont {
  family?: string | null;
  source_type?: string | null;
  url?: string | null;
  format?: string | null;
  weight?: string | null;
  updated_at?: string | null;
}

interface CustomFontBase {
  family: string;
  url: string;
  weight: string;
  updated_at: string | null;
}

/**
 * Validated font. `format` is only meaningful (and always present) for
 * uploaded files; link sources are loaded through their stylesheet.
 */
export type CustomFont =
  | (CustomFontBase & { source_type: "file"; format: CustomFontFormat })
  | (CustomFontBase & { source_type: "link"; format: null });

/**
 * Normalized settings. Branding and contact fields always carry a usable
 * value (locale-aware Meem Market Kuwait defaults when the API omits them or
 * returns placeholder copy); invalid social / video URLs become `""`.
 */
export interface SiteSettings {
  site_name: string;
  site_desc: string;
  meta_desc: string;
  site_copy_right: string;
  logo: string;
  footer_logo: string;
  favicon: string;
  site_email: string;
  email_support: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  promotion_video_url: string;
  youtube: string;
  tiktok: string;
  snapchat: string;
  phone: string;
  fast_shipping_page_publish: boolean;
  minimumOrderAmount: number;
  order_tax_enabled: boolean;
  /** Tax percentage (e.g. 15 for 15%); `null` when not configured. */
  order_tax_rate: number | null;
  currency_selection_enabled: boolean;
  payment_gateways: Record<string, PaymentGatewayState>;
  options: SiteSettingsOptions;
}
