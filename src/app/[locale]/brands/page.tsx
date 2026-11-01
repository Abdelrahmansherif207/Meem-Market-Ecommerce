import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BrandListingPage from "@/features/brands/components/BrandListingPage";
import BrandListingSkeleton from "@/features/brands/components/skeletons/BrandListingSkeleton";
import { withStaticLocale } from "@/i18n/staticLocale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await withStaticLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.brands" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await withStaticLocale(params);
  return (
    <Suspense fallback={<BrandListingSkeleton />}>
      <BrandListingPage locale={locale} />
    </Suspense>
  );
}
