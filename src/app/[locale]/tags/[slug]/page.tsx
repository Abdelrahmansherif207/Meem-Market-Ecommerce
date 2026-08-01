import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { TagDetailPage } from "@/features/tags";
import TagDetailSkeleton from "@/features/tags/components/skeletons/TagDetailSkeleton";
import { tagService } from "@/features/tags/services/tagService";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta.tag" });

  try {
    const tag = await tagService.getTagBySlug(decodeURIComponent(slug), locale);
    return {
      title: `#${tag.name}`,
      description: t("description", { name: tag.name }),
    };
  } catch {
    return { title: t("title") };
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
    await tagService.getTagBySlug(decodedSlug, locale);
  } catch {
    notFound();
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="p-4 md:p-6">
        <Breadcrumb
          items={[
            { label: t("home"), href: "/" },
            { label: "Tags", href: "/tags" },
            { label: `#${decodedSlug}` },
          ]}
        />
      </div>
      <div className="px-4 pb-6 md:px-6">
        <Suspense fallback={<TagDetailSkeleton />}>
          <TagDetailPage slug={decodedSlug} locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
