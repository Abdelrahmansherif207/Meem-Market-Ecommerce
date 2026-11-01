import { ProductDetailsPage } from "@/features/products";
import { productService } from "@/features/products/services/productService";
import { resolveProductDescriptionHtml, stripProductHtml } from "@/features/products/utils";
import { ApiError } from "@/shared/lib/api";
import type { Metadata } from "next";
import { withStaticLocale } from "@/i18n/staticLocale";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Product pages are price-bearing and fetched with `no-store` (see CACHE_TTL
 * doctrine), so they always render fresh server-side — force-dynamic keeps
 * that contract explicit. Per-guest price/stock personalization is client-side.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await withStaticLocale(params);

  try {
    const product = await productService.getProductBySlug(slug, locale);
    const images = Object.values(product.images?.original ?? {});
    const description = stripProductHtml(
      resolveProductDescriptionHtml(product.description, locale),
    ).slice(0, 160);

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        images: images.length > 0 ? [{ url: images[0], width: 800, height: 800 }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: images.length > 0 ? [images[0]] : [],
      },
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return {};
    return {};
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await withStaticLocale(params);

  return <ProductDetailsPage slug={slug} locale={locale} />;
}
