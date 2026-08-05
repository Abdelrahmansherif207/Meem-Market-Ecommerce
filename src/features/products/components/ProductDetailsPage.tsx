import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import type { ProductCategory } from "../types";
import { productService } from "@/features/products/services/productService";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { getDisplayPrice, getOriginalPrice } from "../utils";
import { ProductPageContent } from "./ProductPageContent";
import ProductSlider from "@/features/home/productSlider/ProductSlider";

interface ProductDetailsPageProps {
  slug: string;
  locale: string;
}

function buildCategoryBreadcrumbs(categories: ProductCategory[]): { label: string; href: string }[] {
  if (!categories?.length) return [];
  const sorted = [...categories].sort((a, b) => a.level - b.level);
  return sorted.map((cat) => ({
    label: cat.name,
    href: "/categories/" + cat.slug,
  }));
}

export async function ProductDetailsPage({ slug, locale }: ProductDetailsPageProps) {
  const t = await getTranslations({ locale, namespace: "product" });
  const te = await getTranslations({ locale, namespace: "error" });

  const result = await guardLoad(() => productService.getProductBySlug(slug, locale));

  if (!result.ok) {
    if (result.kind === "not-found") {
      notFound();
    }
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="serverError"
          title={te("serverDownTitle")}
          description={te("serverDownDesc")}
          actions={<RetryButton label={te("retry")} />}
        />
      </main>
    );
  }

  const product = result.data;

  const mappedRelated = product.related_products.map((rp) => ({
    id: rp.id,
    image: rp.image?.thumbnail || "",
    title: rp.name,
    price: getDisplayPrice(rp),
    originalPrice: getOriginalPrice(rp),
    slug: rp.slug ?? `${rp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${rp.id}`,
    inWishlist: rp.in_wishlist,
    tags: rp.tags,
  }));

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: t("home"), href: "/" },
          ...buildCategoryBreadcrumbs(product.categories),
          { label: product.name },
        ]}
      />

      <ProductPageContent product={product} />

      {mappedRelated.length > 0 && (
        <div className="mt-12">
          <ProductSlider title={t("relatedProducts")} items={mappedRelated} />
        </div>
      )}
    </div>
  );
}
