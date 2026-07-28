import { flashSaleService } from "../services/flashSaleService";
import FlashSaleBannerClient from "./FlashSaleBannerClient";
import type { FlashSale } from "../types";

interface FlashSaleBannerSectionProps {
  locale: string;
}

export default async function FlashSaleBannerSection({ locale }: FlashSaleBannerSectionProps) {
  let flashSales: FlashSale[] = [];
  try {
    flashSales = await flashSaleService.getFlashSales(locale);
  } catch (error) {
    console.warn("[FlashSaleBannerSection] Failed to fetch flash sales:", error);
    return null;
  }

  const active = flashSales.filter(
    (fs) => fs.image?.desktop && fs.image?.mobile && new Date(fs.end_date) > new Date(),
  );

  if (!active.length) return null;

  return <FlashSaleBannerClient flashSales={active} locale={locale} />;
}
