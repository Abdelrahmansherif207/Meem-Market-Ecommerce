import type { ProductTag } from "@/shared/types";
import type { ProductCurrency } from "@/features/currencies";

export interface CategoryImage {
  desktop: string;
  mobile: string;
}

export interface CategoryMenuItem {
  id: number;
  name: string;
  slug: string;
  level: 1 | 2 | 3;
  image: CategoryImage;
  children: CategoryMenuItem[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image: CategoryImage;
}

export interface CategoryProductImage {
  thumbnail: string;
  original: Record<string, string>;
}

export interface CategoryProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  has_variants: boolean;
  discount_type: string;
  discount_amount: number;
  quantity: number;
  discount_valid: boolean;
  ratings: number;
  in_stock?: boolean;
  in_wishlist?: boolean;
  image: CategoryProductImage;
  tags?: ProductTag[];
  currency?: ProductCurrency;
}

export interface CategoryFilters {
  brand?: string[];
  category?: string[];
  height?: string[];
  width?: string[];
  length?: string[];
  weight?: string[];
}

export interface CategoryProductsResponse {
  data: CategoryProduct[];
  filters: CategoryFilters;
  links: {
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    path: string;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    last_page_url: string;
    first_page_url: string;
  };
}

/** Laravel cursor paginator `links` — no totals, only navigation URLs. */
export interface CursorLinks {
  path?: string;
  per_page?: number;
  /** Absolute backend URL for the next page; `null` = end of list. */
  next_page_url: string | null;
  /** Absolute backend URL for the previous page; `null` = first page. */
  prev_page_url: string | null;
}

export interface CursorProductsResponse {
  data: CategoryProduct[];
  filters: CategoryFilters;
  links: CursorLinks;
  /**
   * Plain opaque token (newer backend contract). Preferred over parsing
   * `links.next_page_url`; `null` = end of list.
   */
  next_cursor?: string | null;
  prev_cursor?: string | null;
}

/**
 * Normalized cursor-paginated category page returned by the service.
 * `nextCursor` is the opaque token extracted from the backend's absolute
 * `next_page_url` (`null` = no more pages).
 */
export interface CategoryCursorPage {
  products: CategoryProduct[];
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
  nextCursor: string | null;
}
