import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PromotionDetailPage from "@/features/promotions/components/PromotionDetailPage";
import PromotionDetailSkeleton from "@/features/promotions/components/PromotionDetailSkeleton";
import { promotionService } from "@/features/promotions/services/promotionService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const promotion = await promotionService.getPromotion(slug, locale);
    return {
      title: promotion.name,
      description: `Shop ${promotion.name} at Meem Market — limited time offer.`,
      openGraph: {
        title: promotion.name,
        description: `Shop ${promotion.name} at Meem Market.`,
        images: [{ url: promotion.image.desktop }],
      },
    };
  } catch {
    return { title: "Promotion" };
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

  // Validate the promotion exists
  try {
    await promotionService.getPromotion(decodedSlug, locale);
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
      <Suspense fallback={<PromotionDetailSkeleton />}>
        <PromotionDetailPage slug={decodedSlug} locale={locale} />
      </Suspense>
    </div>
  );
}
