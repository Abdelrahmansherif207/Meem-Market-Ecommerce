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
  minimumOrderAmount: number;
  currency_selection_enabled?: boolean;
  options: SiteSettingsOptions | null;
}

export interface SiteSettingsOptions {
  currency?: string;
  base_currency_code?: string;
  catalog_currency_code?: string;
  currency_selection_enabled?: boolean;
  [key: string]: unknown;
}
