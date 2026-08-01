import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SliderDetailPage from "@/features/sliders/components/SliderDetailPage";
import SliderDetailSkeleton from "@/features/sliders/components/SliderDetailSkeleton";
import { sliderService } from "@/features/sliders/services/sliderService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta.slider" });

  try {
    const slider = await sliderService.getSlider(slug, locale);
    const description = t("description", { name: slider.title });
    return {
      title: slider.title,
      description,
      openGraph: {
        title: slider.title,
        description,
        images: [{ url: slider.image.desktop }],
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
    await sliderService.getSlider(decodedSlug, locale);
  } catch (e) {
    console.error("[SliderPage] Failed to fetch slider:", e);
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
      <Suspense fallback={<SliderDetailSkeleton />}>
        <SliderDetailPage slug={decodedSlug} locale={locale} />
      </Suspense>
    </div>
  );
}
