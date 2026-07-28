import { homePageService } from "@/features/home/services/homePageService";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductCard from "@/components/ui/ProductCard";
import type { BannerDetail } from "../types";

interface BannerSectionProps {
  endpoint?: string;
  locale: string;
  title?: string;
}

export default async function BannerSection({ endpoint, locale, title }: BannerSectionProps) {
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

      {products && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const discountPercent =
              product.discount_active && product.current_price < product.price
                ? Math.round((1 - product.current_price / product.price) * 100)
                : 0;
            return (
              <ProductCard
                key={product.id}
                productId={product.id}
                image={product.image.thumbnail}
                title={product.name}
                price={product.current_price}
                originalPrice={product.price}
                discountPercent={discountPercent}
                slug={product.slug}
                hasVariants={product.has_variants}
                deliveryType={product.is_fast_shipping_available ? "fast" : "scheduled"}
                isInStock={product.in_stock ?? product.quantity > 0}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
