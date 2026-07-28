import { withRetry } from "@/shared/utils/retry";
import { pageService } from "../services/pageService";
import { PageSkeleton, SectionSuspense } from "./SectionRenderer";

type PageRendererProps = {
  slug: string;
  locale: string;
};

export default async function PageRenderer({ slug, locale }: PageRendererProps) {
  let page;
  try {
    page = await withRetry(() => pageService.getBySlug(slug, locale));
  } catch {
    return (
      <main className="flex flex-col gap-y-5 py-10 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Page not found</h1>
        <p className="text-text-secondary">This page could not be loaded. Please try again later.</p>
      </main>
    );
  }

  if (!page?.is_active) {
    return (
      <main className="flex flex-col gap-y-5 py-10 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Page not found</h1>
        <p className="text-text-secondary">The requested page is not available.</p>
      </main>
    );
  }

  if (!page.sections?.length) {
    return (
      <main className="flex flex-col gap-y-5 py-10 text-center">
        <h1 className="text-2xl font-bold text-text-primary">{page.title}</h1>
        <p className="text-text-secondary">No content available</p>
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
