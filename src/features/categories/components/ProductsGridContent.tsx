import { getTranslations } from "next-intl/server";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { getCachedCategoryPageData } from "../services/categoryProductsService";
import ProductsToolbar from "./ProductsToolbar";
import ProductsGridIsland from "./ProductsGridIsland";
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
    // The toolbar instance is a secondary fetch of the same cached data as
    // the grid instance. Rendering an ErrorState here would duplicate the
    // grid's fallback (two server-error illustrations stacked). Suppress the
    // toolbar error so only the single grid fallback is visible.
    if (renderToolbar) {
      return null;
    }
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center px-4 py-10 text-center">
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
    <ProductsGridIsland
      key={`${filterKey}:${slug}:${JSON.stringify(searchParams ?? {})}`}
      slug={slug}
      locale={locale}
      searchParams={searchParams ?? {}}
      filterKey={filterKey}
      initialProducts={products}
      initialLinks={links}
      initialCurrency={products[0]?.currency?.code}
    />
  );
}
