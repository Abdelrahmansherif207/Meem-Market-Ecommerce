import PageRenderer from "@/features/pages/components/PageRenderer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.terms" });

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
  const { locale } = await params;
  return <PageRenderer slug="terms" locale={locale} />;
}
