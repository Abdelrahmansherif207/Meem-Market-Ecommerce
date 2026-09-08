export interface SiteSettingsCurrencyOptions {
  currency?: string;
  base_currency_code?: string;
  catalog_currency_code?: string;
  currency_selection_enabled?: boolean;
}

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
  currency_selection_enabled: boolean;
  options: SiteSettingsCurrencyOptions | null;
}
