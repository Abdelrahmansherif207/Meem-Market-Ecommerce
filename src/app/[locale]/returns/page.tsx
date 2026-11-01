import PageRenderer from "@/features/pages/components/PageRenderer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { withStaticLocale } from "@/i18n/staticLocale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await withStaticLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.returns" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await withStaticLocale(params);
  return <PageRenderer slug="returns" locale={locale} />;
}
