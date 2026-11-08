import PageRenderer from "@/features/pages/components/PageRenderer";
import { getInfoPageContent } from "@/features/info";
import { pageService } from "@/features/pages/services/pageService";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const page = await pageService.getBySlug(slug, locale);
    if (page?.title) {
      return {
        title: page.title,
        description: page.title,
      };
    }
  } catch {
    // fall back to local content / generic page metadata below
  }

  const localPage = getInfoPageContent(slug, locale);
  if (localPage?.title) {
    return {
      title: localPage.title,
      description: localPage.title,
    };
  }

  const t = await getTranslations({ locale, namespace: "meta.page" });
  return {
    title: t("title", { name: slug }),
    description: t("description", { name: slug }),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <PageRenderer slug={slug} locale={locale} />;
}
