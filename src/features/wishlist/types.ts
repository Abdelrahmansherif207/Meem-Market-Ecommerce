import type { ProductAttribute } from "@/features/products/types";

/** A variation entry inside a saved product. */
export interface WishlistVariation {
  id: number;
  price?: number;
  current_price?: number;
  quantity?: number;
  attributes: ProductAttribute[];
}

/** Product object nested inside a wishlist item. */
export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  price_after_discount?: number | null;
  price_after_flash_sale?: number | null;
  has_discount?: boolean;
  has_flash_sale?: boolean;
  discount_type?: string | null;
  discount_amount?: number | null;
  quantity?: number;
  in_stock?: boolean;
  image: {
    thumbnail: string;
    original?: Record<string, string>;
  };
  variations?: WishlistVariation[];
}

/** A single saved wishlist entry. */
export interface WishlistItem {
  id: number;
  product_id: number;
  product_variant_id?: number | null;
  product: WishlistProduct;
}

export interface WishlistMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number | null;
  to: number | null;
  path?: string;
}

/** Paginated wishlist payload returned by GET /api/v1/wishlists. */
export interface WishlistResponse {
  data: WishlistItem[];
  links?: WishlistResponseLinks;
  meta?: WishlistMeta;
}

export interface WishlistResponseLinks {
  current_page: number;
  from: number | null;
  to: number | null;
  last_page: number;
  path: string;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  last_page_url: string;
  first_page_url: string;
}

export interface PendingWishlistAction {
  productId: number;
  variantId?: number | null;
  intent: "toggle" | "add" | "remove";
}
