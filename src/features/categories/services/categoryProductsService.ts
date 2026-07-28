import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type {
  CategoryFilters,
  CategoryProduct,
  CategoryProductsResponse,
  SubCategory,
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

export async function getCategoryPageData(
  slug: string,
  locale: string,
  searchParams?: Record<string, string | string[] | undefined>,
  filterKey?: "category" | "banner" | "promotion",
): Promise<{
  products: CategoryProduct[];
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
  links: CategoryProductsResponse["links"];
}> {
  const params = new URLSearchParams();
  params.append(filterKey ?? "category", slug);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
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
      headers: {
        "lang": locale,
      },
      next: { revalidate: 60 },
    },
  );

  const rawFilters = response.data.filters as unknown as RawFilter[];
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

  return {
    products: response.data.data,
    filters,
    filterLabels,
    links: response.data.links,
  };
}

export async function getSearchPageData(
  locale: string,
  searchParams?: Record<string, string | string[] | undefined>,
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
      next: { revalidate: 60 },
    },
  );

  const rawFilters = response.data.filters as unknown as RawFilter[];
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
