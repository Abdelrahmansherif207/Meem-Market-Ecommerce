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

export interface RawSiteSettingsOptions {
  currency?: string | null;
  base_currency_code?: string | null;
  catalog_currency_code?: string | null;
  currency_selection_enabled?: boolean | number | string | null;
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

export interface SiteSettingsOptions {
  currency?: string;
  base_currency_code?: string;
  catalog_currency_code?: string;
  currency_selection_enabled: boolean;
}

/**
 * Normalized settings. Branding and contact fields always carry a usable
 * value (locale-aware Rawd Al-Aseel defaults when the API omits them or
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
