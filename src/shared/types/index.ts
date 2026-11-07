export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductBrandImage {
  desktop: string;
  mobile: string;
}

/**
 * Brand summary embedded in product payloads. Optional on listing
 * responses: some nested endpoints (flash sales, sliders) do not hydrate it.
 */
export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
  image?: ProductBrandImage;
  status?: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * Pagination envelope used by list endpoints that report
 * `{ current_page, per_page, total, has_more_pages }`. `total` may be
 * scoped to the current page rather than the whole pool — use
 * `has_more_pages` to decide whether to fetch page + 1.
 */
export interface PageMeta {
  current_page: number;
  per_page: number;
  total: number;
  has_more_pages: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  links: {
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
  };
  filters: unknown[];
  category: unknown | null;
}
