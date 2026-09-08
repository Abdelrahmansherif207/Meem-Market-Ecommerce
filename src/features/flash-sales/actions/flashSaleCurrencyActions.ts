"use server";

import { flashSaleService } from "../services/flashSaleService";
import type { FlashSaleProduct } from "../types";

/**
 * Flash-sale products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so islands keep their previously rendered prices.
 */
export async function getFlashSaleProductsAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<FlashSaleProduct[]> {
  const detail = await flashSaleService.getFlashSale(
    slug,
    locale,
    currency ?? undefined,
  );
  return detail.products;
}

export async function getEndingSoonAction(
  period: "today" | "week",
  locale: string,
  currency: string | null | undefined,
): Promise<FlashSaleProduct[]> {
  const code = currency ?? undefined;
  return period === "today"
    ? flashSaleService.getEndingToday(locale, code)
    : flashSaleService.getEndingThisWeek(locale, code);
}
