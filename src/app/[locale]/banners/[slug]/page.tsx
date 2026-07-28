import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BannerDetailPage from "@/features/banners/components/BannerDetailPage";
import BannerDetailSkeleton from "@/features/banners/components/BannerDetailSkeleton";
import { bannerService } from "@/features/banners/services/bannerService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const banner = await bannerService.getBanner(slug, locale);
    return {
      title: banner.title,
      description: banner.description || `Explore ${banner.title} at Meem Market.`,
      openGraph: {
        title: banner.title,
        description: banner.description || `Explore ${banner.title} at Meem Market.`,
        images: [{ url: banner.image.desktop }],
      },
    };
  } catch {
    return { title: "Banner" };
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
    await bannerService.getBanner(decodedSlug, locale);
  } catch {
    notFound();
  }

  return (
    <div className="w-full flex flex-col flex-1 p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: t("home"), href: "/" },
          { label: decodedSlug },
        ]}
      />
      <Suspense fallback={<BannerDetailSkeleton />}>
        <BannerDetailPage slug={decodedSlug} locale={locale} />
      </Suspense>
    </div>
  );
}
