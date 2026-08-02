import { sliderService } from "../services/sliderService";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ShoppingBag } from "lucide-react";
import PaginatedProductGrid from "@/components/ui/PaginatedProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import type { SliderDetail } from "../types";

interface SliderDetailPageProps {
  slug: string;
  locale: string;
}

export default async function SliderDetailPage({ slug, locale }: SliderDetailPageProps) {
  const te = await getTranslations({ locale, namespace: "emptyState" });

  let slider: SliderDetail;
  try {
    slider = await sliderService.getSlider(slug, locale);
  } catch {
    return (
      <EmptyState
        variant="notFound"
        title={te("noProductsForSlider")}
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

  const { title, image, products } = slider;

  return (
    <div className="w-full flex flex-col gap-6">
      <picture className="relative h-[170px] w-full overflow-hidden rounded-[20px] sm:h-[230px] lg:h-[300px]">
        <source media="(min-width: 640px)" srcSet={image.desktop} />
        <img
          src={image.mobile}
          alt={title}
          className="h-full w-full object-cover"
        />
      </picture>

      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{title}</h1>

      {products.length === 0 ? (
        <EmptyState
          variant="notFound"
          title={te("noProductsForSlider")}
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
