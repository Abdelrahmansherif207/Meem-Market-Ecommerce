export interface CartItemProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_flash_sale: boolean;
  has_discount: boolean;
  discount_type: string | null;
  discount_amount: number | null;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  sku: string;
  in_stock: boolean;
  quantity: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: CartItemProduct;
  quantity: number;
  price: number;
  total: number;
}

export type DeliveryType = "scheduled" | "fast";

export interface GuestCartItem {
  product_id: number;
  product_variant_id?: number | null;
  quantity: number;
  deliveryType: DeliveryType;
  name: string;
  image: string;
  price: number;
  current_price: number;
  slug: string;
  sku: string;
  in_stock: boolean;
  stock_quantity: number;
}

export interface HydratedCartItem extends GuestCartItem {
  cartItemId?: number;
  total_price?: number;
  discount_amount?: number;
  promotion_id?: number | null;
}

export interface AddBulkPayload {
  items: Array<{
    product_id: number;
    quantity: number;
    product_variant_id?: number | null;
    shipping_method?: "scheduled" | "fast";
  }>;
}

import type { Coupon } from "@/features/coupons/types";

// --- API response types matching the actual /cart endpoint ---

export interface CartApiProduct {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
}

export interface CartApiItem {
  id: number;
  product_id: number;
  product_variant_id?: number | null;
  quantity: number;
  price: number;
  total_price: number;
  attributes: string | null;
  shipping_method: string;
  promotion_id: number | null;
  discount_amount: number;
  is_gift: boolean;
  product: CartApiProduct;
}

export interface CartApiCart {
  id: number;
  user_id: number;
  coupon: Coupon | null;
  coupon_code: string | null;
  status: string;
  reserved_at: string;
  expires_at: string;
  total_items: number;
  total_quantity: number;
  total_price: number;
  subtotal: number;
  coupon_discount: number;
  total_after_coupon: number;
  normal_items: CartApiItem[];
  fast_items: CartApiItem[];
  normal_items_count: number;
  fast_items_count: number;
  has_eligible_promotion: boolean;
}
