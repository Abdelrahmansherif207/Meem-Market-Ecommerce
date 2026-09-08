"use client";

import { useCallback } from "react";
import ProductSlider from "../productSlider/ProductSlider";
import FlashSaleBanner from "./cardSlider/FlashSaleBanner";
import { useCurrencyRefetch } from "@/features/currencies";
import {
  getBannerSectionItemsAction,
  getFlashSaleHomeItemsAction,
  getProductSliderItemsAction,
} from "../actions/homeCurrencyActions";
import type { ProductItem } from "../types";

interface ProductSliderIslandProps {
  fetchKind: "products" | "flash-sales" | "banner";
  endpoint: string;
  locale: string;
  title?: string;
  initialItems: ProductItem[];
  columnsCount?: number;
  badgeText?: string;
  showTimer?: boolean;
  timerEndAt?: string;
  theme?: "light" | "dark";
  autoplay?: boolean;
  sliderSpeed?: number;
}

/**
 * Client island owning currency-driven refetches for home product
 * sliders (products / flash-sales / banner sections). First paint shows
 * server data as-is; refetches with the picker's code as an explicit
 * Server Action argument whenever it diverges.
 */
export default function ProductSliderIsland({
  fetchKind,
  endpoint,
  locale,
  title,
  initialItems,
  columnsCount,
  badgeText,
  showTimer,
  timerEndAt,
  theme,
  autoplay,
  sliderSpeed,
}: ProductSliderIslandProps) {
  const fetchAction = useCallback(
    (currency: string) => {
      if (fetchKind === "flash-sales") {
        return getFlashSaleHomeItemsAction(endpoint, locale, currency);
      }
      if (fetchKind === "banner") {
        return getBannerSectionItemsAction(endpoint, locale, currency);
      }
      return getProductSliderItemsAction(endpoint, locale, currency);
    },
    [fetchKind, endpoint, locale],
  );
  const { data: items, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    initialItems,
    initialItems[0]?.currency?.code,
  );

  if (fetchKind === "flash-sales") {
    return (
      <section className="w-full bg-gradient-to-b from-black via-[#1a1a1a] to-[#2a2a2a] text-white">
        <FlashSaleBanner locale={locale} title={title} />
        <div className="relative">
          <ProductSlider
            items={items}
            columnsCount={columnsCount}
            badgeText={badgeText}
            theme="dark"
            pricesLoading={isRefreshing}
          />
        </div>
      </section>
    );
  }

  return (
    <ProductSlider
      title={title}
      items={items}
      columnsCount={columnsCount}
      badgeText={badgeText}
      showTimer={showTimer}
      timerEndAt={timerEndAt}
      theme={theme}
      autoplay={autoplay}
      sliderSpeed={sliderSpeed}
      pricesLoading={isRefreshing}
    />
  );
}
