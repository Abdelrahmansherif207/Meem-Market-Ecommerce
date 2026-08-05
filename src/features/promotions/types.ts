import type { ProductTag } from "@/shared/types";

export interface PromotionImage {
  desktop: string;
  mobile: string;
}

export interface Promotion {
  id: number;
  name: string;
  slug: string;
  status: boolean;
  image: PromotionImage;
}

export interface PromotionDetail extends Promotion {
  products: PromotionProduct[];
}

export interface PromotionProduct {
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
  in_wishlist?: boolean;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  discount_active?: boolean;
  flash_sale_active?: boolean;
  tags?: ProductTag[];
}
