import ProductSlider from "./ProductSlider";
import { homePageService } from "../services/homePageService";
import { toProductItem } from "../utils";
import type { SectionFrontSetting, ApiProduct } from "../types";

interface ProductSliderSectionProps {
  title: string;
  type: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function ProductSliderSection({
  title,
  locale,
  setting,
  endpoint,
}: ProductSliderSectionProps) {
  if (!endpoint) return null;

  let response: ApiProduct[] | { data: ApiProduct[] } | null = null;
  try {
    response = await homePageService.fetchSectionData<ApiProduct[] | { data: ApiProduct[] }>(endpoint, locale);
  } catch (error) {
    console.error("[ProductSliderSection] Failed to fetch products:", error);
    return null;
  }

  // The products endpoint returns a paginated object { data: [...] }, not a flat array.
  const products = response && !Array.isArray(response) && 'data' in response 
    ? response.data 
    : response;

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  const items = products.map(toProductItem);

  return (
    <ProductSlider
      title={title}
      items={items}
      columnsCount={setting?.columns_count}
      badgeText={setting?.badge_text}
      showTimer={setting?.show_timer}
      timerEndAt={setting?.timer_end_at}
    />
  );
}
