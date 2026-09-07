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
  fast_shipping_page_publish: number;
  minimumOrderAmount: number;
  currency_selection_enabled?: boolean;
  options: SiteSettingsOptions | null;
}

/**
 * Raw `options.fast_shipping` block from `GET /general/settings`.
 * Backend sends scalar values as strings (e.g. `enabled: "1"`), so every
 * field is typed tolerantly and must be parsed before use — see
 * `getFastShippingStatusFromSettings` in the fast-shipping feature.
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
  currency_selection_enabled?: boolean;
  fast_shipping?: FastShippingOptions | null;
  [key: string]: unknown;
}
