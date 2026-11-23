import { homePageService } from "../services/homePageService";
import { resolveLocalizedText, toProductItem } from "../utils";
import ProductShelfIsland from "./ProductShelfIsland";
import type { SectionFrontSetting, ApiProduct } from "../types";

interface ProductShelfSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Catch Beauty product shelf: CMS title + a fluid product rail. Data flow:
 * fetchSectionData → toProductItem → currency island.
 */
export default async function ProductShelfSection({
  title,
  locale,
  setting,
  endpoint,
}: ProductShelfSectionProps) {
  if (!endpoint) return null;

  let response: ApiProduct[] | { data: ApiProduct[] } | null = null;
  try {
    response = await homePageService.fetchSectionData<ApiProduct[] | { data: ApiProduct[] }>(endpoint, locale);
  } catch (error) {
    console.error("[ProductShelfSection] Failed to fetch products:", error);
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
    <ProductShelfIsland
      key={endpoint}
      fetchKind="products"
      endpoint={endpoint}
      locale={locale}
      title={title}
      subtitle={resolveLocalizedText(setting?.subtitle, locale)}
      showTitle={setting?.show_title}
      initialItems={items}
      columnsCount={setting?.columns_count}
      badgeText={setting?.badge_text}
      showTimer={setting?.show_timer}
      timerEndAt={setting?.timer_end_at}
      layout={setting?.layout}
    />
  );
}
