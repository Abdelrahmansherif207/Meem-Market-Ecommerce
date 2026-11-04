import { getTranslations } from "next-intl/server";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { CatchSectionSuspense } from "./redesign/CatchSectionRenderer";
import CatchHelpBanner from "./redesign/CatchHelpBanner";

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
    <>
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-y-12 py-6">
        {page.sections.map((section) => (
          <CatchSectionSuspense key={section.id} section={section} locale={locale} />
        ))}
      </main>
      {/* Screen's static help banner sits between content and footer */}
      <CatchHelpBanner locale={locale} />
    </>
  );
}
