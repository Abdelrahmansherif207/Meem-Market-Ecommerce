"use server";

import { promotionService } from "../services/promotionService";
import type { PromotionProduct } from "../types";

/**
 * Promotion-detail products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so the island keeps its previously rendered prices.
 */
export async function getPromotionProductsAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<PromotionProduct[]> {
  const promotion = await promotionService.getPromotion(
    slug,
    locale,
    currency ?? undefined,
  );
  return promotion.products;
}
