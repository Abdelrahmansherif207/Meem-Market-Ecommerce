import { promotionService } from "../services/promotionService";
import PromotionsSectionClient from "./PromotionsSectionClient";
import type { Promotion } from "../types";

interface PromotionsSectionProps {
  locale: string;
}

export default async function PromotionsSection({ locale }: PromotionsSectionProps) {
  let promotions: Promotion[] = [];
  try {
    promotions = await promotionService.getPromotions(locale);
  } catch (error) {
    console.warn("[PromotionsSection] Failed to fetch promotions:", error);
    return null;
  }

  if (!promotions.length) return null;

  return <PromotionsSectionClient promotions={promotions} />;
}
