import type { WishlistItem } from "./types";

/** Formats the attributes of the saved variation, e.g. "Color: Red, Size: M". */
export function getWishlistVariantLabel(item: WishlistItem): string | null {
  const variations = item.product?.variations ?? [];
  if (variations.length === 0) return null;

  const match = item.product_variant_id
    ? variations.find((v) => v.id === item.product_variant_id)
    : undefined;
  const variant = match ?? variations[0];

  if (!variant?.attributes?.length) return null;
  return variant.attributes
    .map((a) => `${a.attribute_name}: ${a.value}`)
    .join(", ");
}

/** Returns the effective sale price when a discount is active, else null. */
export function getWishlistSalePrice(
  item: WishlistItem,
): { price: number; originalPrice: number } | null {
  const product = item.product;
  const price = product.current_price ?? product.price ?? 0;
  const originalPrice = product.price ?? 0;
  if (originalPrice <= 0 || price >= originalPrice) return null;
  return { price, originalPrice };
}
