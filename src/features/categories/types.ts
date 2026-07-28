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
  is_fast_shipping_available: boolean;
  image: CategoryProductImage;
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
