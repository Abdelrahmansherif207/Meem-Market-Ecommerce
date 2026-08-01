import { withRetry } from "@/shared/utils/retry";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { SectionSuspense } from "@/features/pages/components/SectionRenderer";
import { TagsBannerSection } from "@/features/tags/components/TagsBannerSection";

export async function HomePage({ locale }: { locale: string }) {
  let page: HomeContentPage;
  try {
    page = await withRetry(() => homePageService.getHomePage(locale));
  } catch (err) {
    console.warn("[HomePage] Failed to load page config after retries", err);
    return <main className="flex flex-col gap-y-5" />;
  }

  return (
    <main className="flex flex-col gap-y-5">
      {page.sections.map((section) => (
        <SectionSuspense key={section.id} section={section} locale={locale} />
      ))}
      <TagsBannerSection locale={locale} />
    </main>
  );
}
