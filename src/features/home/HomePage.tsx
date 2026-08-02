import { withRetry } from "@/shared/utils/retry";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { SectionSuspense } from "@/features/pages/components/SectionRenderer";

export async function HomePage({ locale }: { locale: string }) {
  let page: HomeContentPage;
  try {
    page = await withRetry(() => homePageService.getHomePage(locale));
  } catch (err) {
    console.warn("[HomePage] Failed to load page config after retries", err);
    return <main className="flex flex-col gap-y-12" />;
  }

  return (
    <main className="flex flex-col gap-y-12">
      {page.sections.map((section) => (
        <SectionSuspense key={section.id} section={section} locale={locale} />
      ))}
    </main>
  );
}
