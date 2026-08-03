import { getTranslations } from "next-intl/server";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { SectionSuspense } from "@/features/pages/components/SectionRenderer";

export async function HomePage({ locale }: { locale: string }) {
  const result = await guardLoad(() => homePageService.getHomePage(locale), {
    retries: 3,
  });

  if (!result.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
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

  const page: HomeContentPage = result.data;

  return (
    <main className="flex flex-col gap-y-12">
      {page.sections.map((section) => (
        <SectionSuspense key={section.id} section={section} locale={locale} />
      ))}
    </main>
  );
}
