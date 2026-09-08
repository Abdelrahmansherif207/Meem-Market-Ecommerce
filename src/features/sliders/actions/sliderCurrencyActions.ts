"use server";

import { sliderService } from "../services/sliderService";
import type { SliderProduct } from "../types";

/**
 * Slider-detail products in an explicit guest currency (forwarded as
 * `X-Currency`). The server stores nothing — no cookies, no globals.
 * Failures throw so the island keeps its previously rendered prices.
 */
export async function getSliderProductsAction(
  slug: string,
  locale: string,
  currency: string | null | undefined,
): Promise<SliderProduct[]> {
  const slider = await sliderService.getSlider(
    slug,
    locale,
    currency ?? undefined,
  );
  return slider.products;
}
