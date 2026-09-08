"use server";

import { bannerService } from "../services/bannerService";
import type { BannerProduct } from "../types";

/**
 * Banner-detail products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so the island keeps its previously rendered prices.
 */
export async function getBannerProductsAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<BannerProduct[]> {
  const banner = await bannerService.getBanner(
    slug,
    locale,
    currency ?? undefined,
  );
  return banner.products;
}
