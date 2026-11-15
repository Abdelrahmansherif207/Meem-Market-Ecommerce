import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PromotionVideo } from "@/features/settings";
import MeemPromotionVideo from "./MeemPromotionVideo";

/** Temporary campaign hero: CMS sliders are disabled until the carousel returns. */
const HERO_HREF = "/categories";
const HERO_POSTER_SRC = "/meem-new.png";

interface MeemHeroVideoSectionProps {
  locale: string;
  /** CMS sliders-section title ("New Collection"); translation is the fallback. */
  title?: string;
  /** `promotion_video_url` from site settings (already validated). */
  promotionVideo?: PromotionVideo | null;
}

/**
 * Full-width campaign banner. On desktop the video fills the banner and the
 * collection copy sits centred on top; below `md` the 9:16 mobile cut is shown
 * on its own with no overlay. The CMS sliders section still supplies the title
 * and the destination stays the New Collection slider.
 */
export default async function MeemHeroVideoSection({
  locale,
  title,
  promotionVideo,
}: MeemHeroVideoSectionProps) {
  const t = await getTranslations({
    locale,
    namespace: "meemHome.hero",
  });

  return (
    <section className="w-full" aria-labelledby="meem-hero-title">
      <div className="relative w-full overflow-hidden rounded-2xl bg-meem-surface ring-1 ring-meem-border/60 md:rounded-[28px]">
        <div className="relative aspect-[9/16] w-full md:aspect-[2.2/1]">
          {promotionVideo ? (
            <MeemPromotionVideo
              video={promotionVideo}
              poster={HERO_POSTER_SRC}
              title={title || t("title")}
              videoClassName="md:object-[center_40%]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-meem-primary via-meem-primary-active to-meem-deep"
            >
              <div className="absolute -start-24 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -end-24 bottom-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
            </div>
          )}

          {/* Contrast scrim for the white overlay copy (desktop only). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-meem-charcoal/30 via-meem-charcoal/15 to-meem-charcoal/40 md:block"
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85 [text-shadow:0_1px_12px_rgba(20,16,14,0.45)] md:block">
              {t("eyebrow")}
            </p>
            <h1
              id="meem-hero-title"
              className="sr-only max-w-[18ch] font-semibold leading-[1.02] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(20,16,14,0.45)] md:not-sr-only md:mt-4 md:text-5xl lg:text-6xl"
            >
              {title?.trim() || t("title")}
            </h1>
            <Link
              href={HERO_HREF}
              className="pointer-events-auto mt-7 hidden items-center rounded-full bg-white px-7 py-3 text-xs font-semibold text-meem-charcoal shadow-elev-1 transition-colors hover:bg-meem-tint focus-visible:outline-offset-4 md:inline-flex lg:text-sm"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
