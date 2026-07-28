import { getCachedCategoryPageData } from "../services/categoryProductsService";
import CategoryProducts from "./CategoryProducts";

import ProductsToolbar from "./ProductsToolbar";
import ActiveFilterChips from "./ActiveFilterChips";

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
  const { products, links } = await getCachedCategoryPageData(
    slug,
    locale,
    searchParams,
    filterKey,
  );

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
