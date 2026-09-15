import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type {
  CategoryCursorPage,
  CategoryFilters,
  CategoryProduct,
  CategoryProductsResponse,
  CursorProductsResponse,
} from "../types";

interface RawFilterDisplay {
  ar: string;
  en: string;
}

interface RawFilter {
  display: string | RawFilterDisplay;
  key: string;
  data: string[];
}

/** Page size for cursor pagination (backend max is 100). */
const CURSOR_PAGE_SIZE = 20;

/**
 * Query params consumed by the service itself or rejected by the backend in
 * cursor mode — never forwarded verbatim (`search` 422s with cursors,
 * `sort` is translated to `order_price`, `page` is page-mode only).
 */
const STRIPPED_PARAMS = new Set([
  "pagination",
  "cursor",
  "limit",
  "order_price",
  "page",
  "sort",
  "search",
]);

/**
 * Extract the opaque cursor token from the backend's absolute pagination
 * URL. The URL itself is never called directly — requests always go through
 * `apiFetch` so `lang` / `X-Currency` headers are preserved.
 */
function extractCursor(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("cursor") || null;
  } catch {
    return null;
  }
}

function parseFilters(raw: unknown): {
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
} {
  const rawFilters = raw as unknown as RawFilter[];
  const filters: CategoryFilters = {};
  const filterLabels: Record<string, string> = {};

  if (Array.isArray(rawFilters)) {
    for (const f of rawFilters) {
      if (f.key && Array.isArray(f.data)) {
        (filters as Record<string, string[]>)[f.key] = f.data;
        filterLabels[f.key] =
          typeof f.display === "string"
            ? f.display
            : f.display.en ?? f.display.ar ?? f.key;
      }
    }
  }

  return { filters, filterLabels };
}

export async function getCategoryPageData(
  slug: string,
  locale: string,
  searchParams?: Record<string, string | string[] | undefined>,
  filterKey?: "category" | "banner" | "promotion" | "tag",
  currency?: string,
  cursor?: string | null,
): Promise<CategoryCursorPage> {
  const params = new URLSearchParams();
  params.append(filterKey ?? "category", slug);
  params.append("pagination", "cursor");

  // Price-ordered cursor pagination: `sort=price_desc` maps to descending,
  // everything else (including the default) to ascending.
  params.append(
    "order_price",
    searchParams?.sort === "price_desc" ? "desc" : "asc",
  );
  params.append("limit", String(CURSOR_PAGE_SIZE));

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value || STRIPPED_PARAMS.has(key)) return;
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, value);
      }
    });
  }

  const response = await apiFetch<ApiResponse<CursorProductsResponse>>(
    `/general/products?${params.toString()}`,
    {
      headers: {
        "lang": locale,
      },
      // Currency-converted prices are per-guest: never share them through
      // the Data Cache (fetch cache key does not vary by header).
      ...(currency ? { cache: "no-store" as RequestCache, currency } : { next: { revalidate: 60 } }),
    },
  );

  const { filters, filterLabels } = parseFilters(response.data.filters);

  return {
    products: response.data.data,
    filters,
    filterLabels,
    nextCursor:
      response.data.next_cursor ??
      extractCursor(response.data.links?.next_page_url),
  };
}

export async function getSearchPageData(
  locale: string,
  searchParams?: Record<string, string | string[] | undefined>,
  currency?: string,
): Promise<{
  products: CategoryProduct[];
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
}> {
  const params = new URLSearchParams();

  const query = searchParams?.q;
  if (query) {
    params.set("search", Array.isArray(query) ? query[0] : query);
  }

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === "q") return;
      if (value) {
        if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, value);
        }
      }
    });
  }

  const response = await apiFetch<ApiResponse<CategoryProductsResponse>>(
    `/general/products?${params.toString()}`,
    {
      headers: { "lang": locale },
      // Per-guest converted prices must bypass the shared Data Cache.
      ...(currency ? { cache: "no-store" as RequestCache, currency } : { next: { revalidate: 60 } }),
    },
  );

  const { filters, filterLabels } = parseFilters(response.data.filters);

  return {
    products: response.data.data,
    filters,
    filterLabels,
  };
}

export async function getBannerBySlug(
  slug: string,
  locale: string,
): Promise<{
  id: number;
  title: string;
  slug: string;
  description: string;
  image: { desktop: string; mobile: string };
  status: boolean;
  products: unknown[];
} | null> {
  try {
    const response = await apiFetch<ApiResponse<{
      id: number;
      title: string;
      slug: string;
      description: string;
      image: { desktop: string; mobile: string };
      status: boolean;
      products: unknown[];
    }>>(`/general/banners?slug=${encodeURIComponent(slug)}`, {
      headers: { lang: locale },
    });
    return response.data;
  } catch {
    return null;
  }
}

export const getCachedCategoryPageData = cache(getCategoryPageData);
export const getCachedSearchPageData = cache(getSearchPageData);
