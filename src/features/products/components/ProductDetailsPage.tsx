import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { ProductCategory } from "../types";
import { productService } from "@/features/products/services/productService";
import { ApiError } from "@/shared/lib/api";
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

  let product;
  try {
    product = await productService.getProductBySlug(slug, locale);
    console.log("Product details fetched successfully:", product);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const mappedRelated = product.related_products.map((rp) => ({
    id: rp.id,
    image: rp.image?.thumbnail || "",
    title: rp.name,
    price: getDisplayPrice(rp),
    originalPrice: getOriginalPrice(rp),
    slug: rp.slug ?? `${rp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${rp.id}`,
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
