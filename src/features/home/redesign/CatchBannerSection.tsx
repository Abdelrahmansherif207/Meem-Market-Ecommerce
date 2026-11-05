import Image from "next/image";
import { homePageService } from "../services/homePageService";
import CatchShelfIsland from "./CatchShelfIsland";
import type { SectionFrontSetting } from "../types";
import type { BannerDetail } from "@/features/banners/types";
import type { ProductItem } from "../types";

interface CatchBannerSectionProps {
  endpoint?: string;
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
}

/**
 * Wide banner — real-site style: flat image, natural height, `rounded-md`,
 * rendered with the next/image component. When the CMS requests products
 * (`with_products=1`), the screen's recurring "banner + shelf" pattern is
 * rendered below the image.
 */
export default async function CatchBannerSection({
  endpoint,
  locale,
  setting,
}: CatchBannerSectionProps) {
  if (!endpoint) return null;

  let data: BannerDetail | BannerDetail[] | null = null;
  try {
    data = await homePageService.fetchSectionData<BannerDetail | BannerDetail[]>(endpoint, locale);
  } catch {
    return null;
  }

  if (!data) return null;

  const banner: BannerDetail | undefined = Array.isArray(data) ? data[0] : data;
  if (!banner) return null;

  const { title: bannerTitle, image, products } = banner;

  const productItems: ProductItem[] = (products ?? []).map((p) => ({
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
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
    currency: p.currency,
  }));

  return (
    <section className="w-full space-y-6">
      {/* Wide banner image — real-site style: flat, natural height, 6px radius */}
      <a
        href={`/${locale}/banners/${banner.slug}`}
        className="block w-full"
      >
        <Image
          src={image.desktop}
          alt={bannerTitle}
          width={1500}
          height={282}
          loading="lazy"
          className="aspect-auto w-full rounded-xl md:rounded-md"
        />
      </a>

      {productItems.length > 0 && (
        <CatchShelfIsland
          key={endpoint}
          fetchKind="banner"
          endpoint={endpoint}
          locale={locale}
          initialItems={productItems}
          columnsCount={setting?.columns_count}
          badgeText={setting?.badge_text}
        />
      )}
    </section>
  );
}
