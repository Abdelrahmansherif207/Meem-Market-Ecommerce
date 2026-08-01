import type { ProductTag } from "@/shared/types";

export interface ProductAttribute {
  attribute_name: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  price: number;
  current_price: number;
  quantity: number;
  height: string;
  width: string;
  length: string;
  weight: string;
  attributes: ProductAttribute[];
}

export interface ProductReviewUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  user: ProductReviewUser | null;
  images: string[];
}

export interface ProductCategory {
  id: number;
  level: number;
  name: string;
  slug: string;
}

export interface ProductImages {
  thumbnail: string;
  original: Record<string, string>;
}

export interface RelatedProduct {
  id: number;
  name: string;
  slug?: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  has_flash_sale: boolean;
  discount_type: string | null;
  discount_amount: number | null;
  quantity: number;
  ratings: number;
  discount_valid?: boolean;
  tags?: ProductTag[];
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  discount_type: string | null;
  discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  sku: string;
  quantity: number;
  sold_quantity: number;
  in_stock: boolean;
  status: boolean;
  product_type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  has_flash_sale: boolean;
  has_discount: boolean;
  is_fast_shipping_available: boolean;
  images: ProductImages;
  variants: ProductVariant[];
  reviews: ProductReview[];
  related_products: RelatedProduct[];
  categories: ProductCategory[];
  tags?: ProductTag[];
}

export interface ProductSearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  discount_valid: boolean;
  ratings: number;
  image: {
    thumbnail: string;
  };
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  has_flash_sale?: boolean;
  has_variants: boolean;
  discount_type: string | null;
  discount_amount: number | null;
  quantity: number;
  discount_valid: boolean;
  sku?: string;
  in_stock?: boolean;
  is_fast_shipping_available: boolean;
  tags?: ProductTag[];
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

export type PriceInfo = {
  has_flash_sale: boolean;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  price_after_discount: number | null;
  current_price: number;
  price: number;
};