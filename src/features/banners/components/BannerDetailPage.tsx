import { bannerService } from "../services/bannerService";
import PaginatedProductGrid from "@/components/ui/PaginatedProductGrid";
import type { BannerDetail } from "../types";

interface BannerDetailPageProps {
  slug: string;
  locale: string;
}

export default async function BannerDetailPage({ slug, locale }: BannerDetailPageProps) {
  let banner: BannerDetail;
  try {
    banner = await bannerService.getBanner(slug, locale);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-secondary text-lg">Failed to load banner</p>
        <a
          href={`/${locale}`}
          className="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Go to homepage
        </a>
      </div>
    );
  }

  const { title, description, image, products } = banner;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="relative h-42.5 w-full overflow-hidden rounded-[20px] sm:h-57.5 lg:h-75">
        <picture className="block h-full w-full">
          <source media="(min-width: 640px)" srcSet={image.desktop} />
          <img
            src={image.mobile}
            alt={title}
            className="h-full w-full object-cover object-center"
          />
        </picture>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{title}</h1>

      {description && (
        <p className="text-text-secondary text-base md:text-lg">{description}</p>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-text-secondary text-center">
            No products available for this banner.
          </p>
          <a
            href={`/${locale}`}
            className="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Shop our collection
          </a>
        </div>
      ) : (
        <PaginatedProductGrid products={products} itemsPerPage={12} />
      )}
    </div>
  );
}
