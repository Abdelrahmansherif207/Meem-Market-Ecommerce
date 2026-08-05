import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { getCachedCategoryPageData } from "@/features/categories/services/categoryProductsService";
import type { CategoryProduct } from "@/features/categories/types";
import { tagService } from "../services/tagService";

interface TagDetailPageProps {
  slug: string;
  locale: string;
}

export async function TagDetailPage({ slug, locale }: TagDetailPageProps) {
  const t = await getTranslations({ locale, namespace: "tags" });
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => {
            const discountPercent =
              product.has_discount && product.discount_valid
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
                inWishlist={product.in_wishlist}
                tags={product.tags}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
