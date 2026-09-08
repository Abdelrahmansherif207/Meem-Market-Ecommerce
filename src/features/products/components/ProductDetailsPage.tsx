import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import type { ProductCategory } from "../types";
import { productService } from "@/features/products/services/productService";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { ProductDetailIsland } from "./ProductDetailIsland";

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

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: t("home"), href: "/" },
          ...buildCategoryBreadcrumbs(product.categories),
          { label: product.name },
        ]}
      />

      <ProductDetailIsland
        key={slug}
        slug={slug}
        locale={locale}
        initialProduct={product}
      />
    </div>
  );
}
