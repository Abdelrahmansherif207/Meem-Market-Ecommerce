import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { getCachedCategoryPageData } from "@/features/categories/services/categoryProductsService";
import type { CategoryProduct } from "@/features/categories/types";
import { tagService } from "../services/tagService";
import { TagProductsIsland } from "./TagProductsIsland";

interface TagDetailPageProps {
  slug: string;
  locale: string;
}

export async function TagDetailPage({ slug, locale }: TagDetailPageProps) {
  const te = await getTranslations({ locale, namespace: "emptyState" });

  let tag;
  try {
    tag = await tagService.getTagBySlug(slug, locale);
  } catch (error) {
    console.error("[TagDetailPage] Failed to load tag", error);
    notFound();
    return null;
  }

  let products: CategoryProduct[] = [];
  try {
    const data = await getCachedCategoryPageData(slug, locale, undefined, "tag");
    products = data.products;
  } catch (error) {
    console.error("[TagDetailPage] Failed to load tag products", error);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          <span className="text-primary">#</span>
          {tag.name}
        </h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          variant="notFound"
          title={te("noProductsForTag")}
          actions={
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <ShoppingBag className="size-4" />
              {te("browseProducts")}
            </Link>
          }
        />
      ) : (
        <TagProductsIsland
          key={slug}
          slug={slug}
          locale={locale}
          initialProducts={products}
          initialCurrency={products[0]?.currency?.code}
        />
      )}
    </div>
  );
}
