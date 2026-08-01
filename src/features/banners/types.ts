import type { ProductTag } from "@/shared/types";

export interface BannerImage {
  desktop: string;
  mobile: string;
}

export interface Banner {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: BannerImage;
  status: boolean;
}

export interface BannerProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  has_variants: boolean;
  quantity: number;
  in_stock?: boolean;
  is_fast_shipping_available: boolean;
  ratings: number;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  discount_active?: boolean;
  flash_sale_active?: boolean;
  tags?: ProductTag[];
}

export interface BannerDetail extends Banner {
  products: BannerProduct[];
}
