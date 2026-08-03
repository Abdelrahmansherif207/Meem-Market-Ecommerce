import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { pageService } from "../services/pageService";
import { SectionSuspense } from "./SectionRenderer";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";

type PageRendererProps = {
  slug: string;
  locale: string;
};

export default async function PageRenderer({ slug, locale }: PageRendererProps) {
  const te = await getTranslations({ locale, namespace: "error" });
  const tf = await getTranslations({ locale, namespace: "notFound" });
  const tese = await getTranslations({ locale, namespace: "emptyState" });

  const result = await guardLoad(() => pageService.getBySlug(slug, locale), {
    retries: 3,
  });

  if (!result.ok) {
    if (result.kind === "not-found") {
      notFound();
    }
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="serverError"
          title={te("serverDownTitle")}
          description={te("serverDownDesc")}
          actions={<RetryButton label={te("retry")} />}
        />
      </main>
    );
  }

  const page = result.data;

  if (!page?.is_active) {
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="notFound"
          title={tf("title")}
          description={tf("description")}
        />
      </main>
    );
  }

  if (!page.sections?.length) {
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="notFound"
          title={page.title}
          description={tese("noSearchResults")}
        />
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
