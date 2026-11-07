import { homePageService } from "../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import { normalizeList } from "./normalize";
import CatchShelfIsland from "./CatchShelfIsland";
import CatchCountdown from "./CatchCountdown";
import type { SectionFrontSetting, ApiFlashSale, ProductItem } from "../types";
import type { FlashSaleProduct } from "@/features/flash-sales/types";

function flashProductToProductItem(p: FlashSaleProduct): ProductItem {
  return {
    id: p.id,
    image: Object.values(p.image.original)[0] || p.image.thumbnail,
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    ratings: p.ratings,
    reviewsCount: p.ratings_count,
    brands: p.brands,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
    currency: p.currency,
  };
}

interface CatchFlashSaleSectionProps {
  title: string;
  type: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched flash-sale shelf: the first active sale's products in a
 * product grid with a countdown chip when the CMS requests a timer.
 */
export default async function CatchFlashSaleSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchFlashSaleSectionProps) {
  if (!endpoint) return null;

  let flashSales: ApiFlashSale[] = [];
  try {
    flashSales = normalizeList(
      await homePageService.fetchSectionData<ApiFlashSale[] | { data: ApiFlashSale[] }>(endpoint, locale),
    );
  } catch (error) {
    console.error("[CatchFlashSaleSection] Failed to fetch flash sales:", error);
    return null;
  }

  if (!flashSales.length) return null;

  let products: ProductItem[] = [];
  try {
    const firstSlug = flashSales[0].slug;
    if (firstSlug) {
      const detail = await flashSaleService.getFlashSale(firstSlug, locale);
      if (detail.products?.length > 0) {
        products = detail.products.map(flashProductToProductItem);
      }
    }
  } catch (e) {
    console.warn("[CatchFlashSaleSection] Failed to fetch flash sale products:", e);
  }

  if (!products.length) return null;

  const headerAction =
    setting?.show_timer && setting?.timer_end_at ? (
      <CatchCountdown endsAt={setting.timer_end_at} />
    ) : undefined;

  return (
    <CatchShelfIsland
      key={endpoint}
      fetchKind="flash-sales"
      endpoint={endpoint}
      locale={locale}
      title={title}
      initialItems={products}
      columnsCount={setting?.columns_count}
      badgeText={setting?.badge_text}
      headerAction={headerAction}
    />
  );
}
