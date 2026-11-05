import HomeSectionHeader from "./HomeSectionHeader";
import HomeCountdown from "./clients/HomeCountdown";
import HomeProductRail from "./clients/HomeProductRail";
import { homePageService } from "../services/homePageService";
import { toProductItem } from "../utils";
import type { ApiProduct, SectionFrontSetting } from "../types";

interface HomeProductRailSectionProps {
  title: string;
  locale: string;
  endpoint?: string;
  setting?: SectionFrontSetting;
}

/**
 * `products` CMS type — Sovereign Rose rail (design: "Catch Most Wanted").
 * Fetches the same endpoint the shared section uses and exposes the same
 * currency-aware refetch island; only the presentation differs.
 */
export default async function HomeProductRailSection({
  title,
  locale,
  endpoint,
  setting,
}: HomeProductRailSectionProps) {
  if (!endpoint) return null;

  let response: ApiProduct[] | { data: ApiProduct[] } | null = null;
  try {
    response = await homePageService.fetchSectionData<
      ApiProduct[] | { data: ApiProduct[] }
    >(endpoint, locale);
  } catch (error) {
    console.error(
      "[HomeProductRailSection] Failed to fetch products:",
      error,
    );
    return null;
  }

  // The products endpoint returns a paginated object { data: [...] }, not a flat array.
  const products =
    response && !Array.isArray(response) && "data" in response
      ? response.data
      : response;

  if (!Array.isArray(products) || products.length === 0) return null;

  const items = products.map(toProductItem);
  const timerEndAt = setting?.timer_end_at;
  const showTimer = setting?.show_timer !== false && Boolean(timerEndAt);

  return (
    <section className="home-container">
      <HomeSectionHeader
        title={title}
        action={showTimer ? <HomeCountdown endsAt={timerEndAt as string} /> : undefined}
      />
      <HomeProductRail
        items={items}
        fetchKind="products"
        endpoint={endpoint}
        locale={locale}
        initialCurrency={items[0]?.currency?.code}
        columnsCount={setting?.columns_count ?? 5}
        badgeText={setting?.badge_text}
        autoplay={setting?.autoplay}
        sliderSpeed={setting?.slider_speed}
      />
    </section>
  );
}
