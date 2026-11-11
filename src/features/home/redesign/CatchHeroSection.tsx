import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { cn } from "@/shared/utils/cn";
import type { PromotionVideo } from "@/features/settings";
import { resolveLocalizedText } from "../utils";
import CatchHeroVideoPlayer from "./CatchHeroVideoPlayer";
import CatchPromotionVideo from "./CatchPromotionVideo";
import type { SectionFrontSetting } from "../types";

const DEFAULT_CTA_HREF = "/categories";
const DEFAULT_VIDEO_DESKTOP = "/hero/catch-hero-desktop.mp4";
const DEFAULT_VIDEO_MOBILE = "/hero/catch-hero-mobile.mp4";
const DEFAULT_POSTER = "/hero/catch-hero-poster.jpg";

interface CatchHeroSectionProps {
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
 * controls, and configurable alignment/height. The settings promotion video
 * or the current campaign video remains available as a fallback.
 */
export default async function CatchHeroSection({
  locale,
  title,
  setting,
  promotionVideo,
}: CatchHeroSectionProps) {
  const t = await getTranslations({ locale, namespace: "catchHome.hero" });
  const front = setting && !Array.isArray(setting) ? setting : undefined;

  const eyebrow = resolveLocalizedText(front?.eyebrow, locale, t("eyebrow"));
  const heading =
    resolveLocalizedText(front?.heading, locale) ||
    title?.trim() ||
    t("title");
  const subtitle = resolveLocalizedText(front?.subtitle, locale);
  const ctaLabel = resolveLocalizedText(front?.cta_label, locale, t("cta"));
  const ctaHref = front?.cta_href?.trim() || DEFAULT_CTA_HREF;

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

  const cmsVideoDesktop = front?.video_desktop?.trim();
  const cmsVideoMobile = front?.video_mobile?.trim() || cmsVideoDesktop;
  const videoDesktop = cmsVideoDesktop || DEFAULT_VIDEO_DESKTOP;
  const videoMobile = cmsVideoMobile || DEFAULT_VIDEO_MOBILE;
  const poster = front?.poster?.trim() || DEFAULT_POSTER;
  const imageDesktop =
    front?.image_desktop?.trim() || poster || videoDesktop;
  const imageMobile = front?.image_mobile?.trim() || imageDesktop;

  const renderImage = front?.media_type === "image";
  // Priority: CMS artwork → CMS video → settings promotion video → local cut.
  const renderPromotionVideo =
    !renderImage && !cmsVideoDesktop && Boolean(promotionVideo);

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
    tone === "dark"
      ? "bg-gradient-to-b from-catch-ivory/35 via-catch-ivory/15 to-catch-ivory/45"
      : "bg-gradient-to-b from-catch-charcoal/30 via-catch-charcoal/15 to-catch-charcoal/40";

  const eyebrowClass =
    tone === "dark"
      ? "text-catch-muted"
      : "text-white/85 [text-shadow:0_1px_12px_rgba(20,16,14,0.45)]";

  const titleClass =
    tone === "dark"
      ? "text-catch-charcoal"
      : "text-white [text-shadow:0_2px_24px_rgba(20,16,14,0.45)]";

  const subtitleClass = tone === "dark" ? "text-catch-muted" : "text-white/80";

  const ctaClass =
    tone === "dark"
      ? "bg-catch-charcoal text-white hover:bg-catch-berry"
      : "bg-white text-catch-charcoal hover:bg-catch-ivory";

  return (
    <section className="w-full" aria-labelledby="catch-hero-title">
      <div className="relative w-full overflow-hidden rounded-2xl bg-catch-surface ring-1 ring-catch-border/60 md:rounded-[28px]">
        <div className={cn("relative aspect-[9/16] w-full", aspectClass)}>
          {renderImage ? (
            <CampaignImage
              desktop={imageDesktop}
              mobile={imageMobile}
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
          ) : renderPromotionVideo && promotionVideo ? (
            <CatchPromotionVideo
              video={promotionVideo}
              poster={poster}
              title={heading}
              videoClassName="md:object-[center_40%]"
              autoplay={autoplay}
              loop={loop}
              muted={muted}
            />
          ) : (
            <CatchHeroVideoPlayer
              desktopSrc={videoDesktop}
              mobileSrc={videoMobile}
              poster={poster}
              videoClassName="md:object-[center_40%]"
              autoplay={autoplay}
              loop={loop}
              muted={muted}
            />
          )}

          {showOverlay ? (
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
              {eyebrow ? (
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.32em]",
                    eyebrowClass,
                    !showMobileContent && "hidden md:block",
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}

              <h1
                id="catch-hero-title"
                className={cn(
                  "font-semibold leading-[1.02] tracking-[-0.02em]",
                  titleClass,
                  showMobileContent
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
                    !showMobileContent && "hidden md:block",
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
                    showMobileContent ? "inline-flex" : "hidden md:inline-flex",
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
