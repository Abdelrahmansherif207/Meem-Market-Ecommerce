import { withRetry } from "@/shared/utils/retry";
import { pageService } from "../services/pageService";
import { PageSkeleton, SectionSuspense } from "./SectionRenderer";
import EmptyState from "@/components/ui/EmptyState";
import { getTranslations } from "next-intl/server";

type PageRendererProps = {
  slug: string;
  locale: string;
};

export default async function PageRenderer({ slug, locale }: PageRendererProps) {
  const te = await getTranslations({ locale, namespace: "emptyState" });
  const tf = await getTranslations({ locale, namespace: "notFound" });

  let page;
  try {
    page = await withRetry(() => pageService.getBySlug(slug, locale));
  } catch {
    return (
      <main className="flex flex-col py-10">
        <EmptyState variant="notFound" title={tf("title")} description={tf("description")} />
      </main>
    );
  }

  if (!page?.is_active) {
    return (
      <main className="flex flex-col py-10">
        <EmptyState variant="notFound" title={tf("title")} description={tf("description")} />
      </main>
    );
  }

  if (!page.sections?.length) {
    return (
      <main className="flex flex-col py-10">
        <EmptyState variant="notFound" title={page.title} description={te("noSearchResults")} />
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-5">
      {page.sections.map((section) => (
        <SectionSuspense key={section.id} section={section} locale={locale} />
      ))}
    </main>
  );
}

export { PageSkeleton } from "./SectionRenderer";
