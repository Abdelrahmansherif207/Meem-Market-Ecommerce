import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PromotionVideo } from "@/features/settings";
import CatchHeroVideoPlayer from "./CatchHeroVideoPlayer";
import CatchPromotionVideo from "./CatchPromotionVideo";

/** Temporary campaign hero: CMS sliders are disabled until the carousel returns. */
const HERO_HREF = "/categories";
const DESKTOP_VIDEO_SRC = "/hero/catch-hero-desktop.mp4";
const MOBILE_VIDEO_SRC = "/hero/catch-hero-mobile.mp4";
const HERO_POSTER_SRC = "/hero/catch-hero-poster.jpg";

interface CatchHeroVideoSectionProps {
  locale: string;
  /** CMS sliders-section title ("New Collection"); translation is the fallback. */
  title?: string;
  /** `promotion_video_url` from site settings (already validated). */
  promotionVideo?: PromotionVideo | null;
}

/**
 * Full-width campaign banner. On desktop the video fills the banner and the
 * collection copy sits centred on top; below `md` the 9:16 mobile cut is shown
 * on its own with no overlay. The CMS sliders section supplies the title, and
 * the current campaign video remains the fallback until Rawd artwork lands.
 */
export default async function CatchHeroVideoSection({
  locale,
  title,
  promotionVideo,
}: CatchHeroVideoSectionProps) {
  const t = await getTranslations({
    locale,
    namespace: "catchHome.hero",
  });

  return (
    <section className="w-full" aria-labelledby="catch-hero-title">
      <div className="relative w-full overflow-hidden rounded-2xl bg-catch-surface ring-1 ring-catch-border/60 md:rounded-[28px]">
        <div className="relative aspect-[9/16] w-full md:aspect-[2.2/1]">
          {promotionVideo ? (
            <CatchPromotionVideo
              video={promotionVideo}
              poster={HERO_POSTER_SRC}
              title={title || t("title")}
              videoClassName="md:object-[center_40%]"
            />
          ) : (
            <CatchHeroVideoPlayer
              desktopSrc={DESKTOP_VIDEO_SRC}
              mobileSrc={MOBILE_VIDEO_SRC}
              poster={HERO_POSTER_SRC}
              videoClassName="md:object-[center_40%]"
            />
          )}

          {/* Contrast scrim for the white overlay copy (desktop only). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-catch-charcoal/30 via-catch-charcoal/15 to-catch-charcoal/40 md:block"
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85 [text-shadow:0_1px_12px_rgba(20,16,14,0.45)] md:block">
              {t("eyebrow")}
            </p>
            <h1
              id="catch-hero-title"
              className="sr-only max-w-[18ch] font-semibold leading-[1.02] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(20,16,14,0.45)] md:not-sr-only md:mt-4 md:text-5xl lg:text-6xl"
            >
              {title?.trim() || t("title")}
            </h1>
            <Link
              href={HERO_HREF}
              className="pointer-events-auto mt-7 hidden items-center rounded-full bg-white px-7 py-3 text-xs font-semibold text-catch-charcoal shadow-elev-1 transition-colors hover:bg-catch-surface focus-visible:outline-offset-4 md:inline-flex lg:text-sm"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
