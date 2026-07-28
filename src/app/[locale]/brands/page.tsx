import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BrandListingPage from "@/features/brands/components/BrandListingPage";
import BrandListingSkeleton from "@/features/brands/components/skeletons/BrandListingSkeleton";

export async function generateMetadata({ params: _params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return {
    title: "Brands",
    description: "Browse all brands at Catch.",
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={<BrandListingSkeleton />}>
      <BrandListingPage locale={locale} />
    </Suspense>
  );
}
