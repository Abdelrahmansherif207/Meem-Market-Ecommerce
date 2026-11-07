import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { homePageService } from "../services/homePageService";
import { normalizeList } from "./normalize";
import CatchHeroSlider from "./CatchHeroSlider";
import CatchShelfIsland from "./CatchShelfIsland";
import type { SectionFrontSetting, ProductItem } from "../types";
import type { Slider, SliderDetail, SliderProduct } from "@/features/sliders/types";

const SLIDER_MEDIA_STYLE = {
  "--media-aspect": "1150 / 368",
  "--media-aspect-mobile": "1150 / 368",
} as CSSProperties;

interface CatchHeroSliderSectionProps {
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

function sliderProductToProductItem(p: SliderProduct): ProductItem {
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
    inWishlist: undefined,
    ratings: p.ratings,
    reviewsCount: p.ratings_count,
    brands: p.brands,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    currency: p.currency,
  };
}

/**
 * Hero section. The CMS may point at either:
 * - a slider list (`general/sliders?start_date=...`) → carousel, or
 * - a slider detail (`general/sliders?slug=...`) → single hero image
 *   with its products rendered as the screen's shelf below.
 */
export default async function CatchHeroSliderSection({
  locale,
  title,
  setting,
  endpoint,
}: CatchHeroSliderSectionProps) {
  if (!endpoint) return null;

  let payload: Slider[] | SliderDetail | { data?: Slider[] } | null = null;
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    payload = await homePageService.fetchSectionData<Slider[] | SliderDetail | { data?: Slider[] }>(endpoint, locale);
  } catch (error) {
    console.warn("[CatchHeroSliderSection] Failed to fetch sliders:", error);
    return null;
  }

  const list = normalizeList<Slider>(payload);
  const validSliders = list.filter((s) => s.image?.desktop && s.image?.mobile);
  if (validSliders.length > 1) {
    return (
      <CatchHeroSlider
        sliders={validSliders}
        autoplay={setting?.autoplay}
        sliderSpeed={setting?.slider_speed}
      />
    );
  }

  // Slider detail shape: { image, title, slug, products } — hero + shelf.
  const detail =
    payload && !Array.isArray(payload) && "image" in payload
      ? (payload as SliderDetail)
      : validSliders.length === 1
        ? validSliders[0]
        : null;
  if (!detail?.image?.desktop) return null;

  const products: ProductItem[] = ((detail as SliderDetail | null)?.products ?? []).map(
    sliderProductToProductItem,
  );

  return (
    <section className="w-full space-y-6">
      <Link
        href={`/sliders/${detail.slug}`}
        className="block w-full overflow-hidden rounded-2xl focus-visible:outline-offset-[-2px]"
      >
        <div className="catch-media-well" style={SLIDER_MEDIA_STYLE}>
          <CampaignImage
            desktop={detail.image.desktop}
            mobile={detail.image.mobile}
            alt={detail.title}
            width={1150}
            height={368}
            mobileWidth={1150}
            mobileHeight={368}
            priority
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
        </div>
      </Link>

      {products.length > 0 && (
        <CatchShelfIsland
          // "banner" kind: the slider-detail payload ({ image, products })
          // has the same shape the banner currency action already handles.
          fetchKind="banner"
          endpoint={endpoint}
          locale={locale}
          title={title}
          initialItems={products}
          columnsCount={setting?.columns_count}
        />
      )}
    </section>
  );
}
