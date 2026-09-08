"use server";

import { brandService } from "../services/brandService";
import type { BrandProduct } from "../types";

/**
 * Brand-detail products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so the island keeps its previously rendered prices.
 */
export async function getBrandProductsAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<BrandProduct[]> {
  const brand = await brandService.getBrand(slug, locale, currency ?? undefined);
  return brand.products;
}
