import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { SectionFrontSetting } from "@/features/home/types";
import { tagService } from "../services/tagService";
import { TagPill } from "./TagPill";
import styles from "./TagsBannerSection.module.css";

interface TagsBannerSectionProps {
  title?: string;
  type: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

const MIN_MARQUEE_TAGS = 5;

export async function TagsBannerSection({
  title,
  locale,
  setting,
  endpoint,
}: TagsBannerSectionProps) {
  const t = await getTranslations({ locale, namespace: "tags" });

  let tags;
  try {
    tags = endpoint
      ? await tagService.getTagsByEndpoint(endpoint, locale)
      : await tagService.getTags(locale);
  } catch (error) {
    console.error("[TagsBannerSection] Failed to load tags", error);
    return null;
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  const isRtl = locale === "ar";
  const autoplay = setting?.autoplay !== false;
  const sliderSpeed = setting?.slider_speed ?? 5000;
  const shouldMarquee = autoplay && tags.length >= MIN_MARQUEE_TAGS;
  const marqueeDuration = (sliderSpeed * tags.length) / 4000;

  const pills = (setIndex: number) =>
    tags.map((tag) => (
      <TagPill key={`${setIndex}-${tag.id}`} name={tag.name} slug={tag.slug} theme="dark" />
    ));

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-black via-[#1a1a1a] to-[#2a2a2a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.25)_0%,_transparent_70%)]" />
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold uppercase tracking-[1.5px] text-white opacity-90 sm:text-sm">
            {t("exploreLabel")}
          </span>
          <h2 className="text-[28px] font-black leading-[1.05] tracking-tight text-white sm:text-[40px] lg:text-[48px]">
            {title || t("exploreTitle")}
          </h2>
          <p className="text-base font-medium leading-tight text-white/90 sm:text-lg">
            {t("exploreSubtitle")}
          </p>
        </div>

        {shouldMarquee ? (
          <div className={styles.marquee}>
            <div
              className={styles.track}
              dir={isRtl ? "rtl" : "ltr"}
              style={{ animationDuration: `${marqueeDuration}s` }}
            >
              <div className={styles.group}>{pills(0)}</div>
              <div className={styles.group} aria-hidden>
                {pills(1)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">{pills(0)}</div>
        )}

        <div>
          <Link
            href="/tags"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#111] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
