import { getTranslations } from "next-intl/server";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import { resolvePromotionVideo } from "@/features/settings/lib/video";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { CatchSectionSuspense } from "./redesign/CatchSectionRenderer";
import CatchHeroVideoSection from "./redesign/CatchHeroVideoSection";
import CatchHelpBanner from "./redesign/CatchHelpBanner";

export async function HomePage({ locale }: { locale: string }) {
  const result = await guardLoad(() => homePageService.getHomePage(locale), {
    retries: 3,
  });

  if (!result.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <div className="catch-surface">
        <main className="mx-auto flex w-full max-w-[1440px] flex-col px-3 py-10 sm:px-4 lg:px-8">
          <ErrorState
            variant="serverError"
            title={te("serverDownTitle")}
            description={te("serverDownDesc")}
            actions={<RetryButton label={te("retry")} />}
          />
        </main>
      </div>
    );
  }

  const page: HomeContentPage = result.data;
  const settings = await getCachedSettings(locale);
  const promotionVideo = resolvePromotionVideo(settings.promotion_video_url);

  // A CMS `hero` section wins. Until Rawd campaign artwork is supplied, keep the
  // existing campaign video as the temporary homepage hero fallback.
  const hasHero = page.sections.some((section) => section.type === "hero");
  const slidersSection = page.sections.find(
    (section) => section.type === "sliders",
  );

  return (
    <div className="catch-surface">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-y-10 px-3 py-6 sm:gap-y-12 sm:px-4 lg:gap-y-16 lg:px-8">
        {!hasHero ? (
          <CatchHeroVideoSection
            locale={locale}
            title={slidersSection?.title}
            promotionVideo={promotionVideo}
          />
        ) : null}
        {page.sections.map((section) => (
          <CatchSectionSuspense
            key={section.id}
            section={section}
            locale={locale}
            promotionVideo={promotionVideo}
          />
        ))}
      </main>
      {/* Screen's static help banner sits between content and footer */}
      <CatchHelpBanner locale={locale} />
    </div>
  );
}
