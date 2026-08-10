import { SiteReviewsPage } from "@/features/site-reviews";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "siteReviews" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SiteReviewsPage locale={locale} />;
}