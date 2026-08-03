import { getTranslations } from "next-intl/server";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { getCachedCategoryPageData } from "../services/categoryProductsService";
import CategoryProducts from "./CategoryProducts";
import ProductsToolbar from "./ProductsToolbar";
import ActiveFilterChips from "./ActiveFilterChips";
import ErrorState from "@/components/ui/ErrorState";

interface ProductsGridContentProps {
  slug: string;
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  filterKey?: "category" | "banner" | "promotion";
  renderToolbar?: boolean;
}

export default async function ProductsGridContent({
  slug,
  locale,
  searchParams,
  filterKey = "category",
  renderToolbar,
}: ProductsGridContentProps) {
  const result = await guardLoad(() =>
    getCachedCategoryPageData(slug, locale, searchParams, filterKey),
  );

  if (!result.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <div className="py-8">
        <ErrorState
          compact
          variant="serverError"
          title={te("serverDownTitle")}
          description={te("serverDownDesc")}
        />
      </div>
    );
  }

  const { products, links } = result.data;

  if (renderToolbar) {
    return <ProductsToolbar links={links} />;
  }

  return (
    <>
      <ActiveFilterChips />
      <CategoryProducts products={products} links={links} />
    </>
  );
}
