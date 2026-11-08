import type { ApiProduct, LocalizedText, ProductItem } from "./types";

/**
 * Resolve CMS front-setting copy for the active locale. Falls back to the
 * other locale, then to the provided static message. Plain strings are
 * returned as-is for backwards compatibility with older section settings.
 */
export function resolveLocalizedText(
  value: LocalizedText | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value.trim() || fallback;

  const direct = locale === "ar" ? value.ar : value.en;
  const alternate = locale === "ar" ? value.en : value.ar;
  return direct?.trim() || alternate?.trim() || fallback;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toProductItem(p: ApiProduct): ProductItem {
  const originalImage =
    Object.values(p.image.original)[0] || p.image.thumbnail;
  const hasFlashSale = p.price_after_flash_sale != null;

  return {
    id: p.id,
    slug: p.slug ?? `${slugify(p.name)}-${p.id}`,
    image: originalImage,
    title: p.name,
    price: hasFlashSale ? p.price_after_flash_sale! : (p.current_price ?? p.price_after_discount ?? p.price ?? 0),
    originalPrice: p.price ?? 0,
    inStock: p.quantity > 0 ? p.quantity : 0,
    stockQuantity: p.quantity,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: hasFlashSale,
    inWishlist: p.in_wishlist,
    ratings: p.ratings,
    reviewsCount: p.ratings_count,
    brands: p.brands,
    tags: p.tags,
    currency: p.currency,
  };
}
