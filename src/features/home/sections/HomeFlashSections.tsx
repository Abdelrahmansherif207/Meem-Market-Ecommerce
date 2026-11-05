import { Clock, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";

import HomeSectionHeader from "./HomeSectionHeader";
import HomeCountdown from "./clients/HomeCountdown";
import FlashSaleSwiper from "./clients/FlashSaleSwiper";
import HomeProductRail from "./clients/HomeProductRail";
import { flashSaleProductToItem, normalizeList } from "./mappers";
import { homePageService } from "../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import type { FlashSale } from "@/features/flash-sales/types";
import type {
  ApiFlashSale,
  ProductItem,
  SectionFrontSetting,
} from "../types";

/* ──────────────────────────────────────────────────────────────────────── */

interface HomeFlashSalesSectionProps {
  title: string;
  locale: string;
  endpoint?: string;
  setting?: SectionFrontSetting;
}

/**
 * `flash-sales` — Sovereign Rose rose-tinted frame (Stitch: "Daily Flash
 * Deals"): icon chip, CMS title + sale description, live glass countdown
 * from the real `end_date`, and a currency-aware product rail. Endpoint,
 * settings and data mapping are identical to the shared section.
 */
export async function HomeFlashSalesSection({
  title,
  locale,
  endpoint,
  setting,
}: HomeFlashSalesSectionProps) {
  if (!endpoint) return null;

  let flashSales: ApiFlashSale[] = [];
  try {
    flashSales = normalizeList<ApiFlashSale>(
      await homePageService.fetchSectionData<unknown>(endpoint, locale),
    );
  } catch (error) {
    console.error("[HomeFlashSalesSection] Failed to fetch flash sales:", error);
    return null;
  }

  const sale = flashSales.find((fs) => fs.slug);
  if (!sale?.slug) return null;

  let products: ProductItem[] = [];
  try {
    // Server pre-render keeps the shared section behavior (no currency arg).
    const detail = await flashSaleService.getFlashSale(sale.slug, locale);
    products = (detail.products ?? []).map(flashSaleProductToItem);
  } catch (error) {
    console.warn(
      "[HomeFlashSalesSection] Failed to fetch flash sale products:",
      error,
    );
  }

  if (!products.length) return null;

  const te = await getTranslations({ locale, namespace: "home.flashStrip" });

  return (
    <section className="home-container">
      <div className="home-flash-frame home-shadow-float">
        {/* Stitch header row: rose bolt chip + title + "Limited Stocks" pill */}
        <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--home-rose) text-white shadow-sm">
              <Zap className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="home-display text-xl font-bold text-(--home-ink) sm:text-[1.375rem]">
                  {title || sale.name}
                </h2>
                <span className="hidden rounded-full bg-[#ffd9dd] px-2 py-0.5 text-[11px] font-bold uppercase text-[#70343f] sm:inline-block">
                  {te("limitedStocks")}
                </span>
              </div>
              {sale.discription && (
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {sale.discription}
                </p>
              )}
            </div>
          </div>
          <HomeCountdown endsAt={sale.end_date} />
        </div>
        <HomeProductRail
          items={products}
          fetchKind="flash-sales"
          endpoint={endpoint}
          locale={locale}
          initialCurrency={products[0]?.currency?.code}
          columnsCount={setting?.columns_count ?? 5}
          badgeText={setting?.badge_text}
          autoplay={setting?.autoplay !== false}
          sliderSpeed={setting?.slider_speed}
        />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

/**
 * `flash-sale` — single-deal creative banner with live countdown, mirroring
 * `FlashSaleBannerSection` data rules (active sales only, real end dates).
 */
export async function HomeFlashBannerSection({ locale }: { locale: string }) {
  let flashSales: FlashSale[] = [];
  try {
    flashSales = await flashSaleService.getFlashSales(locale);
  } catch (error) {
    console.warn("[HomeFlashBannerSection] Failed to fetch flash sales:", error);
    return null;
  }

  const active = flashSales.filter(
    (fs) => fs.image?.desktop && fs.image?.mobile && new Date(fs.end_date) > new Date(),
  );

  if (!active.length) return null;

  return <FlashSaleSwiper flashSales={active} />;
}

/* ──────────────────────────────────────────────────────────────────────── */

type EndingPeriod = "today" | "week";

/**
 * `ending_today` / `ending_this_week` — rail of products ending soon with
 * the same explicit services as the shared `EndingSoonSection`.
 */
export async function HomeEndingSoonSection({
  title,
  locale,
  period,
}: {
  title: string;
  locale: string;
  period: EndingPeriod;
}) {
  let products: Parameters<typeof flashSaleProductToItem>[0][] = [];
  try {
    products =
      period === "today"
        ? await flashSaleService.getEndingToday(locale)
        : await flashSaleService.getEndingThisWeek(locale);
  } catch (error) {
    console.warn(
      `[HomeEndingSoonSection] Failed to fetch ending-${period} products:`,
      error,
    );
    return null;
  }

  const items = products.map(flashSaleProductToItem);
  if (!items.length) return null;

  return (
    <section className="home-container">
      <HomeSectionHeader
        title={title}
        icon={<Clock className="size-5" aria-hidden />}
      />
      <HomeProductRail items={items} columnsCount={5} />
    </section>
  );
}
