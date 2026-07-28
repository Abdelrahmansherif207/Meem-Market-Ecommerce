import type { ApiProduct, ProductItem } from "./types";

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
    isFastShippingAvailable: p.is_fast_shipping_available,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: hasFlashSale,
  };
}
