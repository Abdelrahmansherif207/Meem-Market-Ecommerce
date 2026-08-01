import InfoPageRenderer from "@/features/info/components/InfoPageRenderer";
import { getInfoPageContent } from "@/features/info/content/pageContent";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const page = getInfoPageContent(slug, locale);
  if (page) {
    return {
      title: page.title,
      description: page.title,
    };
  }

  const t = await getTranslations({ locale, namespace: "meta.info" });
  return {
    title: t("title", { name: slug }),
    description: t("description", { name: slug }),
  };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <InfoPageRenderer slug={slug} locale={locale} />;
}
