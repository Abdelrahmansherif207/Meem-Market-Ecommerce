import { bannerService } from "../services/bannerService";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ShoppingBag } from "lucide-react";
import PaginatedProductGrid from "@/components/ui/PaginatedProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import type { BannerDetail } from "../types";

interface BannerDetailPageProps {
  slug: string;
  locale: string;
}

export default async function BannerDetailPage({ slug, locale }: BannerDetailPageProps) {
  const te = await getTranslations({ locale, namespace: "emptyState" });

  let banner: BannerDetail;
  try {
    banner = await bannerService.getBanner(slug, locale);
  } catch {
    return (
      <EmptyState
        variant="notFound"
        title={te("noProductsForBanner")}
        actions={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
          >
            {te("shopCollection")}
          </Link>
        }
      />
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
        <EmptyState
          variant="notFound"
          title={te("noProductsForBanner")}
          actions={
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <ShoppingBag className="size-4" />
              {te("shopCollection")}
            </Link>
          }
        />
      ) : (
        <PaginatedProductGrid products={products} itemsPerPage={12} />
      )}
    </div>
  );
}
