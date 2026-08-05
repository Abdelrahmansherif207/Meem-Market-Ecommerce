import { homePageService } from "@/features/home/services/homePageService";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductSlider from "@/features/home/productSlider/ProductSlider";
import type { BannerDetail } from "../types";
import type { ProductItem, SectionFrontSetting } from "@/features/home/types";

interface BannerSectionProps {
  endpoint?: string;
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
}

export default async function BannerSection({ endpoint, locale, title, setting }: BannerSectionProps) {
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

  const { title: bannerTitle, description, image, products } = banner;

  const productItems: ProductItem[] = (products ?? []).map((p) => ({
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
  }));

  return (
    <section className="w-full flex flex-col gap-4">
      {title ? <SectionTitle title={title} /> : null}
      <a
        href={`/${locale}/banners/${banner.slug}`}
        className="group relative block h-[170px] w-full overflow-hidden rounded-[20px] sm:h-[230px] lg:h-[300px]"
      >
        <picture className="block h-full w-full">
          <source media="(min-width: 640px)" srcSet={image.desktop} />
          <img
            src={image.mobile}
            alt={bannerTitle}
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8">
          <h2 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold drop-shadow-md line-clamp-2">
            {bannerTitle}
          </h2>
          {description && (
            <p className="text-white/90 text-sm sm:text-base mt-1 line-clamp-2 drop-shadow-md">
              {description}
            </p>
          )}
        </div>
      </a>

      {productItems.length > 0 && (
        <ProductSlider
          items={productItems}
          columnsCount={setting?.columns_count}
        />
      )}
    </section>
  );
}
