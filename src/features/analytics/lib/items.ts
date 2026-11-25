import type { ProductCardItem, ProductDetail, RelatedProduct } from "@/features/products/types";
import type { CategoryProduct } from "@/features/categories/types";
import type { CartApiItem, HydratedCartItem } from "@/features/cart/types";
import type { GuestCartLine, GuestOrderItem } from "@/features/guest/types";
import { getDisplayPrice, getOriginalPrice } from "@/features/products/utils";

/**
 * GA4 ecommerce item builders.
 *
 * `item_id` is ALWAYS the product id (as a string) — the SKU is missing from
 * the server cart payload, so product id is the only identifier shared by
 * every surface and every event. Variants go to `item_variant`.
 *
 * Prices are real store numbers passed through untouched (no rounding), so
 * the decimal precision of the source currency is preserved. Discounts are
 * only reported when the API actually carries both prices.
 */

export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  discount?: number;
  quantity?: number;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
  sku?: string;
}

/** Everything the generic builder may receive; missing fields are omitted. */
export interface GA4ItemInput {
  id: number;
  name: string;
  price?: number;
  originalPrice?: number | null;
  quantity?: number;
  variantId?: number | null;
  sku?: string | null;
  brand?: string | null;
  category?: string | null;
  index?: number;
}

function withDecimalPrecision(value: number): number {
  // Prices arrive already converted by the backend/store. Division (line
  // total / quantity) can leave float artifacts (12.34000000000001) — trim
  // them without losing real precision: 3 decimals covers every ISO-4217
  // currency including KWD (3), never invents or drops a real decimal.
  return Math.round(value * 1000) / 1000;
}

export function buildGA4Item(input: GA4ItemInput): GA4EcommerceItem {
  const item: GA4EcommerceItem = {
    item_id: String(input.id),
    item_name: input.name,
  };
  if (input.price !== undefined && Number.isFinite(input.price)) {
    item.price = withDecimalPrecision(input.price);
  }  if (input.originalPrice != null && input.originalPrice > (item.price ?? 0)) {
    item.discount = withDecimalPrecision(input.originalPrice - (item.price ?? 0));
  }
  if (input.quantity !== undefined && Number.isFinite(input.quantity)) {
    item.quantity = input.quantity;
  }
  if (input.variantId != null) item.item_variant = String(input.variantId);
  if (input.sku) item.sku = input.sku;
  if (input.brand) item.item_brand = input.brand;
  if (input.category) item.item_category = input.category;
  if (input.index !== undefined) item.index = input.index + 1;
  return item;
}

function brandOf(brands?: { name: string }[]): string | undefined {
  return brands?.[0]?.name?.trim() || undefined;
}

/** Canonical listing card (home shelves, sliders, category/search grids). */
export function fromProductCardItem(item: ProductCardItem, index?: number): GA4EcommerceItem {
  return buildGA4Item({
    id: item.id,
    name: item.title,
    price: item.price,
    originalPrice: item.originalPrice,
    sku: item.sku,
    brand: brandOf(item.brands),
    index,
  });
}

/** Category / search grid payload. Display price = flash → discount → current. */
export function fromCategoryProduct(product: CategoryProduct, index?: number): GA4EcommerceItem {
  return buildGA4Item({
    id: product.id,
    name: product.name,
    price:
      product.price_after_flash_sale ??
      product.price_after_discount ??
      product.current_price,
    originalPrice: product.price,
    sku: undefined,
    brand: brandOf(product.brands),
    index,
  });
}

/** PDP related / bundle cards. */
export function fromRelatedProduct(product: RelatedProduct, index?: number): GA4EcommerceItem {
  return buildGA4Item({
    id: product.id,
    name: product.name,
    price: getDisplayPrice(product),
    originalPrice: getOriginalPrice(product),
    index,
  });
}

/** Product detail page (price follows the selected variant when one exists). */
export function fromProductDetail(
  product: ProductDetail,
  options?: { variantId?: number | null; variantPrice?: number | null },
): GA4EcommerceItem {
  const mainCategory = [...(product.categories ?? [])].sort(
    (a, b) => a.level - b.level,
  )[0];
  return buildGA4Item({
    id: product.id,
    name: product.name,
    price: options?.variantPrice ?? getDisplayPrice(product),
    originalPrice: getOriginalPrice(product),
    variantId: options?.variantId,
    sku: product.sku,
    category: mainCategory?.name,
  });
}

/** Cart page line (server or hydrated guest). */
export function fromHydratedCartItem(item: HydratedCartItem): GA4EcommerceItem {
  return buildGA4Item({
    id: item.product_id,
    name: item.name,
    price: item.current_price,
    quantity: item.quantity,
    variantId: item.product_variant_id,
    sku: item.sku,
  });
}

/** Auth checkout / server cart raw line. */
export function fromCartApiItem(item: CartApiItem): GA4EcommerceItem {
  return buildGA4Item({
    id: item.product_id,
    name: item.product.name,
    price: item.quantity > 0 ? item.total_price / item.quantity : item.price,
    quantity: item.quantity,
    variantId: item.product_variant_id ?? null,
  });
}

/** Server-backed guest cart line. */
export function fromGuestCartLine(line: GuestCartLine): GA4EcommerceItem {
  return buildGA4Item({
    id: line.productId,
    name: line.name,
    price: line.unitPrice,
    quantity: line.quantity,
    variantId: line.productVariantId,
    sku: line.sku,
  });
}

/** Guest order item (confirmation page — purchase event). */
export function fromGuestOrderItem(item: GuestOrderItem): GA4EcommerceItem {
  return buildGA4Item({
    id: item.productId,
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    variantId: null,
  });
}

/**
 * Auth order item (`/general/orders/{id}` — purchase event). The order
 * carries both catalog and display-currency amounts; prefer the
 * display-currency (`converted_*`) values, which pair with `order.currency`.
 */
export function fromOrderItem(item: {
  quantity: number;
  unit_price: number;
  total_price: number;
  converted_unit_price: number;
  converted_total_price: number;
  product: { id: number; name: string };
}): GA4EcommerceItem {
  const price =
    item.converted_unit_price > 0 ? item.converted_unit_price : item.unit_price;
  return buildGA4Item({
    id: item.product.id,
    name: item.product.name,
    price,
    quantity: item.quantity,
  });
}
