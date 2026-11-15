import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { cn } from "@/shared/utils/cn";
import {
  isLegacyBrandUrl,
  sanitizeLegacyBrand,
  sanitizeLegacyCmsMedia,
} from "@/shared/utils/legacyBrand";
import type { PromotionVideo } from "@/features/settings";
import { resolveLocalizedText } from "../utils";
import MeemHeroVideoPlayer from "./MeemHeroVideoPlayer";
import MeemPromotionVideo from "./MeemPromotionVideo";
import type { SectionFrontSetting } from "../types";

const DEFAULT_CTA_HREF = "/categories";

interface MeemHeroSectionProps {
  locale: string;
  /** CMS section title; used when the front setting has no localized heading. */
  title?: string;
  setting?: SectionFrontSetting;
  /** `promotion_video_url` fallback when the CMS hero has no video. */
  promotionVideo?: PromotionVideo | null;
}

/**
 * CMS campaign hero. Supports art-directed video or image artwork, a
 * localized eyebrow/heading/subtitle/CTA, token-based tone and overlay
 * controls, and configurable alignment/height. When the CMS has no hero
 * section yet, HomePage keeps the static fallback hero in place.
 */
export default async function MeemHeroSection({
  locale,
  title,
  setting,
  promotionVideo,
}: MeemHeroSectionProps) {
  const t = await getTranslations({ locale, namespace: "meemHome.hero" });
  const front = setting && !Array.isArray(setting) ? setting : undefined;

  // Stale CMS copy may still say "Catch Beauty"; replace it at render time.
  const eyebrow = sanitizeLegacyBrand(
    resolveLocalizedText(front?.eyebrow, locale, t("eyebrow")),
    locale,
  );
  const heading = sanitizeLegacyBrand(
    resolveLocalizedText(front?.heading, locale) ||
      title?.trim() ||
      t("title"),
    locale,
  );
  const cmsSubtitle = sanitizeLegacyBrand(
    resolveLocalizedText(front?.subtitle, locale),
    locale,
  );
  const ctaLabel = sanitizeLegacyBrand(
    resolveLocalizedText(front?.cta_label, locale, t("cta")),
    locale,
  );
  const rawCtaHref = front?.cta_href?.trim() || DEFAULT_CTA_HREF;
  const ctaHref = isLegacyBrandUrl(rawCtaHref) ? DEFAULT_CTA_HREF : rawCtaHref;

  const showCta = front?.show_cta !== false && Boolean(ctaHref);
  const showOverlay = front?.show_overlay !== false;
  const showMobileContent = front?.show_mobile_content === true;
  const tone = front?.tone === "dark" ? "dark" : "light";
  const align = front?.content_align ?? "center";
  const position = front?.content_position ?? "center";
  const height = front?.height ?? "standard";
  const autoplay = front?.autoplay ?? true;
  const loop = front?.loop ?? true;
  const muted = front?.muted ?? true;

  // Retired catch assets are dropped; absolute backend media URLs are kept.
  const cmsVideoDesktop = sanitizeLegacyCmsMedia(front?.video_desktop);
  const cmsVideoMobile = sanitizeLegacyCmsMedia(front?.video_mobile) || cmsVideoDesktop;
  const cmsImageDesktop = sanitizeLegacyCmsMedia(front?.image_desktop);
  const cmsImageMobile = sanitizeLegacyCmsMedia(front?.image_mobile) || cmsImageDesktop;
  const poster = sanitizeLegacyCmsMedia(front?.poster) || cmsImageDesktop;

  // Priority: CMS artwork → CMS video → settings promotion video → Meem panel.
  const renderImage = front?.media_type === "image" && Boolean(cmsImageDesktop);
  const renderCmsVideo = !renderImage && Boolean(cmsVideoDesktop);
  const renderPromotionVideo =
    !renderImage && !renderCmsVideo && Boolean(promotionVideo);
  const renderFallback =
    !renderImage && !renderCmsVideo && !renderPromotionVideo;

  const subtitle = cmsSubtitle || (renderFallback ? t("subtitle") : "");

  // The gradient panel is dark, so always use light copy and show it on mobile.
  const effectiveTone = renderFallback ? "light" : tone;
  const showContentOnMobile = showMobileContent || renderFallback;

  const aspectClass =
    height === "compact"
      ? "md:aspect-[2.6/1]"
      : height === "tall"
        ? "md:aspect-[1.8/1]"
        : "md:aspect-[2.2/1]";

  const alignClass =
    align === "start"
      ? "items-start text-start"
      : align === "end"
        ? "items-end text-end"
        : "items-center text-center";

  const positionClass =
    position === "bottom" ? "justify-end pb-8 md:pb-12" : "justify-center";

  const overlayClass =
    effectiveTone === "dark"
      ? "bg-gradient-to-b from-meem-ivory/35 via-meem-ivory/15 to-meem-ivory/45"
      : "bg-gradient-to-b from-meem-charcoal/30 via-meem-charcoal/15 to-meem-charcoal/40";

  const eyebrowClass =
    effectiveTone === "dark"
      ? "text-meem-muted"
      : "text-white/85 [text-shadow:0_1px_12px_rgba(20,16,14,0.45)]";

  const titleClass =
    effectiveTone === "dark"
      ? "text-meem-charcoal"
      : "text-white [text-shadow:0_2px_24px_rgba(20,16,14,0.45)]";

  const subtitleClass =
    effectiveTone === "dark" ? "text-meem-muted" : "text-white/85";

  const ctaClass =
    effectiveTone === "dark"
      ? "bg-meem-charcoal text-white hover:bg-meem-deep"
      : "bg-white text-meem-charcoal hover:bg-meem-ivory";

  return (
    <section className="w-full" aria-labelledby="meem-hero-title">
      <div className="relative w-full overflow-hidden rounded-2xl bg-meem-surface ring-1 ring-meem-border/60 md:rounded-[28px]">
        <div className={cn("relative aspect-[9/16] w-full", aspectClass)}>
          {renderImage ? (
            <CampaignImage
              desktop={cmsImageDesktop}
              mobile={cmsImageMobile}
              alt={heading}
              width={1500}
              height={682}
              mobileWidth={720}
              mobileHeight={1280}
              sizes="100vw"
              priority
              fill
              className="object-cover"
            />
          ) : renderCmsVideo ? (
            <MeemHeroVideoPlayer
              desktopSrc={cmsVideoDesktop}
              mobileSrc={cmsVideoMobile}
              poster={poster}
              videoClassName="md:object-[center_40%]"
              autoplay={autoplay}
              loop={loop}
              muted={muted}
            />
          ) : renderPromotionVideo && promotionVideo ? (
            <MeemPromotionVideo
              video={promotionVideo}
              poster={poster}
              title={heading}
              videoClassName="md:object-[center_40%]"
              autoplay={autoplay}
              loop={loop}
              muted={muted}
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

          {showOverlay && !renderFallback ? (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0",
                showMobileContent ? "block" : "hidden md:block",
                overlayClass,
              )}
            />
          ) : null}

          <div
            className={cn(
              "absolute inset-0 flex flex-col px-6",
              positionClass,
              alignClass,
            )}
          >
            <div
              className={cn(
                "max-w-3xl",
                align === "center" && "mx-auto",
              )}
            >
              {renderFallback ? (
                <span className="mb-5 inline-flex items-center justify-center rounded-2xl bg-white/95 px-4 py-2.5 shadow-elev-2">
                  <Image
                    src="/meem-new.png"
                    alt=""
                    width={516}
                    height={335}
                    priority
                    className="h-14 w-auto object-contain md:h-16"
                  />
                </span>
              ) : null}

              {eyebrow ? (
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.32em]",
                    eyebrowClass,
                    !showContentOnMobile && "hidden md:block",
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}

              <h1
                id="meem-hero-title"
                className={cn(
                  "font-semibold leading-[1.02] tracking-[-0.02em]",
                  titleClass,
                  showContentOnMobile
                    ? "mt-3 text-4xl sm:text-5xl lg:text-6xl"
                    : "sr-only md:not-sr-only md:mt-4 md:text-5xl lg:text-6xl",
                )}
              >
                {heading}
              </h1>

              {subtitle ? (
                <p
                  className={cn(
                    "mt-3 max-w-xl text-sm md:text-base",
                    subtitleClass,
                    align === "center" && "mx-auto",
                    !showContentOnMobile && "hidden md:block",
                  )}
                >
                  {subtitle}
                </p>
              ) : null}

              {showCta ? (
                <Link
                  href={ctaHref}
                  className={cn(
                    "mt-7 items-center rounded-full px-7 py-3 text-xs font-semibold shadow-elev-1 transition-colors focus-visible:outline-offset-4 lg:text-sm",
                    ctaClass,
                    showContentOnMobile ? "inline-flex" : "hidden md:inline-flex",
                  )}
                >
                  {ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
