import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { homePageService } from "../services/homePageService";
import CatchShelfIsland from "./CatchShelfIsland";
import type { SectionFrontSetting } from "../types";
import type { BannerDetail } from "@/features/banners/types";
import type { ProductItem } from "../types";

const BANNER_MEDIA_STYLE = {
  "--media-aspect": "1500 / 377",
  "--media-aspect-mobile": "1500 / 377",
} as CSSProperties;

/**
 * Temporary artwork normalization: the CMS serves these campaigns at 1150×368,
 * so they letterbox narrower than the 1380×260 Summer/Back-to-School strips.
 * Local 1380×260 re-exports keep the artwork full-width until the CMS uploads
 * are replaced; remove this map and the matching files in `public/banners/`
 * afterwards.
 */
const BANNER_ART_OVERRIDES: Record<
  string,
  { src: string; width: number; height: number }
> = {
  "valentines-day-s2": {
    src: "/banners/valentines-day-s2-1380x260.jpg",
    width: 1380,
    height: 260,
  },
  "black-friday-deals-s2": {
    src: "/banners/black-friday-deals-s2-1380x260.jpg",
    width: 1380,
    height: 260,
  },
  "cyber-monday-s2": {
    src: "/banners/cyber-monday-s2-1380x260.jpg",
    width: 1380,
    height: 260,
  },
};

interface CatchBannerSectionProps {
  endpoint?: string;
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
}

/**
 * Rawd Al-Aseel wide banner: a layout-reserving media well with art-directed
 * mobile artwork. When the CMS requests products (`with_products=1`), the
 * recurring "banner + shelf" pattern renders below the image.
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
  const artOverride = BANNER_ART_OVERRIDES[banner.slug];
  const desktopArt = artOverride?.src ?? image.desktop;
  const mobileArt = artOverride?.src ?? image.mobile;
  const artWidth = artOverride?.width ?? 1500;
  const artHeight = artOverride?.height ?? 377;

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
    reviewsCount: p.ratings_count,
    brands: p.brands,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
    currency: p.currency,
  }));

  return (
    <section className="w-full space-y-6">
      <Link
        href={`/banners/${banner.slug}`}
        className="block w-full overflow-hidden rounded-2xl focus-visible:outline-offset-[-2px]"
      >
        <div className="catch-media-well" style={BANNER_MEDIA_STYLE}>
          <CampaignImage
            desktop={desktopArt}
            mobile={mobileArt}
            alt={bannerTitle}
            width={artWidth}
            height={artHeight}
            mobileWidth={artWidth}
            mobileHeight={artHeight}
            sizes="(max-width: 1440px) 100vw, 1440px"
            fill
          />
        </div>
      </Link>

      {productItems.length > 0 && (
        <CatchShelfIsland
          key={endpoint}
          fetchKind="banner"
          endpoint={endpoint}
          locale={locale}
          initialItems={productItems}
          columnsCount={setting?.columns_count}
          badgeText={setting?.badge_text}
          layout={setting?.layout}
        />
      )}
    </section>
  );
}
