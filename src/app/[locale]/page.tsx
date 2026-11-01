import { HomePage } from "@/features/home/HomePage";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { withStaticLocale } from "@/i18n/staticLocale";

/**
 * Home sections are price/countdown-bearing and fetched with `no-store`
 * (see CACHE_TTL doctrine), so this route must always render fresh —
 * force-dynamic keeps that contract explicit.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await withStaticLocale(params);
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    description: t("metaDescription"),
    openGraph: {
      description: t("metaDescription"),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await withStaticLocale(params);
  return <HomePage locale={locale} />;
}
