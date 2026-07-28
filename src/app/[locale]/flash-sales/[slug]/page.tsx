import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FlashSaleDetailPage from "@/features/flash-sales/components/FlashSaleDetailPage";
import FlashSaleDetailSkeleton from "@/features/flash-sales/components/FlashSaleDetailSkeleton";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const fs = await flashSaleService.getFlashSale(slug, locale);
    return {
      title: fs.name,
      description: fs.description || `Shop ${fs.name} — limited time flash sale.`,
      openGraph: {
        title: fs.name,
        description: fs.description || `Shop ${fs.name} at Catch.`,
        images: [{ url: fs.image.desktop }],
      },
    };
  } catch {
    return { title: "Flash Sale" };
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
    await flashSaleService.getFlashSale(decodedSlug, locale);
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
      <Suspense fallback={<FlashSaleDetailSkeleton />}>
        <FlashSaleDetailPage slug={decodedSlug} locale={locale} />
      </Suspense>
    </div>
  );
}
