import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BrandDetailPage from "@/features/brands/components/BrandDetailPage";
import BrandDetailSkeleton from "@/features/brands/components/skeletons/BrandDetailSkeleton";
import { brandService } from "@/features/brands/services/brandService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta.brand" });

  try {
    const brand = await brandService.getBrand(slug, locale);
    const description = t("description", { name: brand.name });
    return {
      title: brand.name,
      description,
      openGraph: {
        title: brand.name,
        description,
        images: [{ url: brand.image.desktop || brand.image.mobile }],
      },
    };
  } catch {
    return { title: t("title") };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const t = await getTranslations({ locale, namespace: "header.breadcrumb" });

  try {
    await brandService.getBrand(decodedSlug, locale);
  } catch {
    notFound();
  }

  return (
    <div className="w-full flex flex-col flex-1">
      <div className="p-4 md:p-6">
        <Breadcrumb
          items={[
            { label: t("home"), href: "/" },
            { label: "Brands", href: "/brands" },
            { label: decodedSlug },
          ]}
        />
      </div>
      <Suspense fallback={<BrandDetailSkeleton />}>
        <BrandDetailPage slug={decodedSlug} locale={locale} />
      </Suspense>
    </div>
  );
}
