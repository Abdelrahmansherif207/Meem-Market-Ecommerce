import CardSlider from "./CardSlider";
import CardGrid from "../cardGrid/CardGrid";
import FlashSaleBanner from "./FlashSaleBanner";
import ProductSlider from "../../productSlider/ProductSlider";
import { homePageService } from "../../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import type { SectionFrontSetting, ApiFlashSale, ApiCoupon, Promotion, CardSlideItem, ProductItem } from "../../types";
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
    isFastShippingAvailable: p.is_fast_shipping_available,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
  };
}

interface FlashSaleSectionProps {
  title: string;
  type: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function FlashSaleSection({
  title,
  type,
  locale,
  setting,
  endpoint,
}: FlashSaleSectionProps) {
  if (!endpoint) return null;

  let items: CardSlideItem[] = [];
  let flashSaleItems: { name: string; slug: string; image: { desktop: string; mobile: string } }[] = [];

  try {
    if (type === "coupons") {
      const coupons = await homePageService.fetchSectionData<ApiCoupon[]>(endpoint, locale);
      items = coupons.map((coupon) => ({
        id: coupon.id,
        title: coupon.name,
        image: coupon.image,
        borderColor: coupon.borderColor,
      }));
    } else if (type === "promotions") {
      const promo = await homePageService.fetchSectionData<Promotion | Promotion[]>(endpoint, locale);
      const promoList = Array.isArray(promo) ? promo : [promo];
      items = promoList.map((p) => ({
        id: p.id,
        title: p.name,
        image: p.image,
        href: p.slug ? `/category/${p.slug}` : undefined,
      }));
    } else if (type === "brands") {
      const itemsData = await homePageService.fetchSectionData<Promotion[]>(endpoint, locale);
      items = itemsData.map((item) => ({
        id: item.id,
        title: item.name,
        image: item.image,
        href: item.slug ? `/category/${item.slug}` : undefined,
      }));
    } else {
      const flashSales = await homePageService.fetchSectionData<ApiFlashSale[]>(endpoint, locale);
      flashSaleItems = flashSales.map((fs) => ({
        name: fs.name,
        slug: fs.slug,
        image: fs.image,
      }));
    }
  } catch (error) {
    console.error(`[FlashSaleSection] Failed to fetch ${type}:`, error);
    return null;
  }

  if (type === "flash-sales") {
    if (!flashSaleItems.length) return null;

    let products: ProductItem[] = [];
    try {
      const firstSlug = flashSaleItems[0].slug;
      if (firstSlug) {
        const detail = await flashSaleService.getFlashSale(firstSlug, locale);
        if (detail.products?.length > 0) {
          products = detail.products.map(flashProductToProductItem);
        }
      }
    } catch (e) {
      console.warn("[FlashSaleSection] Failed to fetch flash sale products:", e);
    }

    if (!products.length) return null;

    return (
      <section className="w-full bg-gradient-to-b from-black via-[#1a1a1a] to-[#2a2a2a] text-white">
        <FlashSaleBanner locale={locale} title={title} />
        <div className="relative">
          <ProductSlider
            items={products}
            columnsCount={setting?.columns_count}
            badgeText={setting?.badge_text}
            theme="dark"
          />
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  const sectionContent = setting?.layout === "grid" ? (
    <CardGrid title={title} items={items} />
  ) : (
    <CardSlider
      title={title}
      items={items}
      autoplay={setting?.autoplay}
      sliderSpeed={setting?.slider_speed}
      slidesPerView={type === "coupons" ? 5 : undefined}
    />
  );

  if (setting?.theme === "dark") {
    return (
      <section className="text-white rounded-xl p-4">
        {sectionContent}
      </section>
    );
  }

  return sectionContent;
}
