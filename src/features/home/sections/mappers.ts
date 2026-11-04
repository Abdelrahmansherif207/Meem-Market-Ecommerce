import type { ProductItem } from "../types";
import type { FlashSaleProduct } from "@/features/flash-sales/types";
import type { BannerProduct } from "@/features/banners/types";

/**
 * Homepage-section product mappers.
 * These mirror the exact field mapping already used by the shared section
 * components (see `actions/homeCurrencyActions.ts` and `FlashSaleSection`),
 * so data semantics stay identical — only the presentation is redesigned.
 */

/**
 * CMS list endpoints may return a plain array, `{ data: [...] }` or a
 * paginated `{ data: { data: [...] } }` wrapper. Normalize before any
 * `.filter`/`.map` so client-side rendering never crashes on shapes.
 */
export function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "data" in value) {
    const inner = (value as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
    if (inner && typeof inner === "object" && "data" in inner) {
      const nested = (inner as { data: unknown }).data;
      if (Array.isArray(nested)) return nested as T[];
      // Nested single object (e.g. `{ data: { data: singleSlider } }`)
      if (nested && typeof nested === "object") return [nested as T];
    }
    // Single object payload (e.g. `?slug=` endpoints returning one record)
    if (inner && typeof inner === "object") return [inner as T];
  }
  // Bare single object (sliders/detail-like responses)
  if (value && typeof value === "object") return [value as T];
  return [];
}

export function flashSaleProductToItem(p: FlashSaleProduct): ProductItem {
  return {
    id: p.id,
    image: Object.values(p.image?.original ?? {})[0] || p.image?.thumbnail || "",
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    ratings: p.ratings,
    tags: p.tags,
    currency: p.currency,
  };
}

export function bannerProductToItem(p: BannerProduct): ProductItem {
  return {
    id: p.id,
    image: Object.values(p.image?.original ?? {})[0] || p.image?.thumbnail || "",
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    ratings: p.ratings,
    tags: p.tags,
    currency: p.currency,
  };
}
