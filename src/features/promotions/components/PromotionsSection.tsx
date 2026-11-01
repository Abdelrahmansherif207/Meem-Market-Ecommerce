import { homePageService } from "@/features/home/services/homePageService";
import { promotionService } from "../services/promotionService";
import PromotionsSectionClient from "./PromotionsSectionClient";
import type { SectionFrontSetting } from "@/features/home/types";
import type { Promotion } from "../types";

interface PromotionsSectionProps {
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function PromotionsSection({
  locale,
  title,
  setting,
  endpoint,
}: PromotionsSectionProps) {
  let promotions: Promotion[] = [];
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    promotions = endpoint
      ? await homePageService.fetchSectionData<Promotion[]>(endpoint, locale)
      : await promotionService.getPromotions(locale);
  } catch (error) {
    console.warn("[PromotionsSection] Failed to fetch promotions:", error);
    return null;
  }

  if (!promotions.length) return null;

  return (
    <PromotionsSectionClient
      promotions={promotions}
      title={title}
      columnsCount={setting?.columns_count}
      layout={setting?.layout}
      autoplay={setting?.autoplay}
      sliderSpeed={setting?.slider_speed}
    />
  );
}
