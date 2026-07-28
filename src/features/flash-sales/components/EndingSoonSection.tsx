import { flashSaleService } from "../services/flashSaleService";
import EndingSoonClient from "./EndingSoonClient";
import type { FlashSaleProduct } from "../types";

interface EndingSoonSectionProps {
  locale: string;
  period: "today" | "week";
}

export default async function EndingSoonSection({ locale, period }: EndingSoonSectionProps) {
  let products: FlashSaleProduct[] = [];
  try {
    products = period === "today"
      ? await flashSaleService.getEndingToday(locale)
      : await flashSaleService.getEndingThisWeek(locale);
  } catch (error) {
    console.warn(`[EndingSoonSection] Failed to fetch ending-${period} products:`, error);
    return null;
  }

  if (!products.length) return null;

  return <EndingSoonClient products={products} period={period} locale={locale} />;
}
