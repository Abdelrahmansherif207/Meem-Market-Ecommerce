import { ProductDetailsPage } from "@/features/products";
import { productService } from "@/features/products/services/productService";
import { ApiError } from "@/shared/lib/api";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const product = await productService.getProductBySlug(slug, locale);
    const images = Object.values(product.images?.original ?? {});
    const description = product.description?.replace(/<[^>]*>/g, "").slice(0, 160);

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
  const { locale, slug } = await params;

  return <ProductDetailsPage slug={slug} locale={locale} />;
}
