"use server";

import { productService } from "../services/productService";
import type { ProductDetail } from "../types";

/**
 * Product detail (incl. related products) in an explicit guest currency
 * (forwarded as `X-Currency`). The server stores nothing — no cookies,
 * no globals. Failures throw so the island keeps its previously
 * rendered prices.
 */
export async function getProductDetailAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<ProductDetail> {
  return productService.getProductBySlug(slug, locale, currency ?? undefined);
}
