import { getTranslations } from "next-intl/server";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import { resolvePromotionVideo } from "@/features/settings/lib/video";
import { homePageService } from "./services/homePageService";
import type { HomeContentPage } from "./types";
import { MeemSectionSuspense } from "./redesign/MeemSectionRenderer";
import MeemHeroSection from "./redesign/MeemHeroSection";
import MeemHelpBanner from "./redesign/MeemHelpBanner";

export async function HomePage({ locale }: { locale: string }) {
  const result = await guardLoad(() => homePageService.getHomePage(locale), {
    retries: 3,
  });

  if (!result.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <div className="meem-surface">
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

  // A CMS `hero` or `sliders` section owns the top of the page. When neither
  // exists, render the Meem gradient panel so the homepage never loses its hero.
  const hasHero = page.sections.some(
    (section) => section.type === "hero" || section.type === "sliders",
  );

  return (
    <div className="meem-surface">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-y-10 px-3 py-6 sm:gap-y-12 sm:px-4 lg:gap-y-16 lg:px-8">
        {!hasHero ? <MeemHeroSection locale={locale} /> : null}
        {page.sections.map((section) => (
          <MeemSectionSuspense
            key={section.id}
            section={section}
            locale={locale}
            promotionVideo={promotionVideo}
          />
        ))}
      </main>
      {/* Screen's static help banner sits between content and footer */}
      <MeemHelpBanner locale={locale} />
    </div>
  );
}
