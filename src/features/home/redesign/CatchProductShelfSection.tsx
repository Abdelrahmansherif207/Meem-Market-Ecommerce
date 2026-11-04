import { homePageService } from "../services/homePageService";
import { toProductItem } from "../utils";
import CatchShelfIsland from "./CatchShelfIsland";
import type { SectionFrontSetting, ApiProduct } from "../types";

interface CatchProductShelfSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen "product shelf": CMS title + underlined "View all" + a
 * 7-column grid of screen-matched product cards. Data flow is identical
 * to the existing ProductSliderSection (fetchSectionData → toProductItem
 * → currency island).
 */
export default async function CatchProductShelfSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchProductShelfSectionProps) {
  if (!endpoint) return null;

  let response: ApiProduct[] | { data: ApiProduct[] } | null = null;
  try {
    response = await homePageService.fetchSectionData<ApiProduct[] | { data: ApiProduct[] }>(endpoint, locale);
  } catch (error) {
    console.error("[CatchProductShelfSection] Failed to fetch products:", error);
    return null;
  }

  // The products endpoint returns a paginated object { data: [...] }, not a flat array.
  const products = response && !Array.isArray(response) && "data" in response
    ? response.data
    : response;

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  const items = products.map(toProductItem);

  return (
    <CatchShelfIsland
      key={endpoint}
      fetchKind="products"
      endpoint={endpoint}
      locale={locale}
      title={title}
      initialItems={items}
      columnsCount={setting?.columns_count}
      badgeText={setting?.badge_text}
      showTimer={setting?.show_timer}
      timerEndAt={setting?.timer_end_at}
    />
  );
}
