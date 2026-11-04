import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import HomeSectionHeader from "./HomeSectionHeader";
import HomeProductRail from "./clients/HomeProductRail";
import { bannerProductToItem } from "./mappers";
import { homePageService } from "../services/homePageService";
import type { BannerDetail } from "@/features/banners/types";
import type { ProductItem, SectionFrontSetting } from "../types";

interface HomeBannerSectionProps {
  endpoint?: string;
  locale: string;
  title: string;
  setting?: SectionFrontSetting;
  variant?: BannerVariant;
}

export type BannerVariant = "dark" | "blush";

/** Fetch one banner creative (+products) by the section endpoint. */
export async function fetchHomeBanner(
  parentLocale: string,
  endpoint?: string,
): Promise<BannerDetail | null> {
  if (!endpoint) return null;
  try {
    const data = await homePageService.fetchSectionData<
      BannerDetail | BannerDetail[]
    >(endpoint, parentLocale);
    const banner = Array.isArray(data) ? data[0] : data;
    return banner ?? null;
  } catch {
    return null;
  }
}

/**
 * `banners` CMS type — Stitch "High-Impact Campaign Banner": rounded-xl
 * creative panel with a start-side gradient overlay, real banner copy and
 * an "Explore" CTA bridging to the existing banner detail route. The rail
 * of real banner products renders below, same fetch/refetch contract.
 */
export default async function HomeBannerSection({
  endpoint,
  locale,
  title,
  setting,
  variant = "dark",
}: HomeBannerSectionProps) {
  const banner = await fetchHomeBanner(locale, endpoint);
  if (!banner) return null;

  const t = await getTranslations({ locale, namespace: "home" });
  const productItems: ProductItem[] = (banner.products ?? []).map(
    bannerProductToItem,
  );

  return (
    <section className="home-container">
      {title && <HomeSectionHeader title={title} />}

      <CampaignBannerCreative
        banner={banner}
        variant={variant}
        eyebrow={title}
        ctaLabel={t("shopNow")}
      />

      {productItems.length > 0 && (
        <div className="mt-4">
          <HomeProductRail
            items={productItems}
            fetchKind="banner"
            endpoint={endpoint}
            locale={locale}
            initialCurrency={productItems[0]?.currency?.code}
            columnsCount={setting?.columns_count ?? 5}
            badgeText={setting?.badge_text}
            autoplay={setting?.autoplay}
            sliderSpeed={setting?.slider_speed}
          />
        </div>
      )}
    </section>
  );
}

/* ── Stitch campaign creative (shared by single + paired layout) ─────── */

export function CampaignBannerCreative({
  banner,
  variant,
  eyebrow,
  ctaLabel,
}: {
  banner: BannerDetail;
  variant: BannerVariant;
  eyebrow?: string;
  ctaLabel?: string;
}) {
  const image = banner.image.desktop || banner.image.mobile;
  const dark = variant === "dark";

  return (
    <Link
      href={`/banners/${banner.slug}`}
      className="group/b relative flex min-h-[240px] w-full flex-col justify-center overflow-hidden rounded-xl bg-(--home-primary) p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:min-h-[280px] lg:p-10"
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/b:scale-105"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <span
        aria-hidden
        className={
          dark
            ? "absolute inset-0 bg-gradient-to-r from-[#121214] via-[#121214]/80 to-transparent"
            : "absolute inset-0 bg-gradient-to-r from-[#ffd9dd] via-[#ffd9dd]/85 to-transparent"
        }
      />

      <span className={dark ? "relative z-10 block max-w-lg" : "relative z-10 block max-w-lg text-[#70343f]"}>
        {eyebrow && (
          <span className="mb-2 inline-block rounded bg-[#d88b97] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            {eyebrow}
          </span>
        )}
        <span
          className={
            dark
              ? "home-display mt-1 block text-[22px] font-bold leading-tight text-white line-clamp-2 sm:text-[28px] lg:text-[28px]"
              : "home-display mt-1 block text-[22px] font-bold leading-tight text-[#70343f] line-clamp-2 sm:text-[28px] lg:text-[28px]"
          }
        >
          {banner.title}
        </span>
        {banner.description && (
          <span
            className={
              dark
                ? "mt-1.5 block text-[12px] leading-[18px] text-white/80 line-clamp-2 sm:text-sm"
                : "mt-1.5 block text-[12px] leading-[18px] text-[#70343f]/90 line-clamp-2 sm:text-sm"
            }
          >
            {banner.description}
          </span>
        )}
        {ctaLabel && (
          <span
            className={
              dark
                ? "mt-4 inline-flex items-center gap-1 rounded bg-white px-4 py-2 text-[13px] font-bold text-(--home-primary) transition-colors group-hover/b:bg-[#f4f3f1]"
                : "mt-4 inline-flex items-center gap-1 rounded bg-[#d88b97] px-4 py-2 text-[13px] font-bold text-white transition-colors group-hover/b:bg-[#793c47]"
            }
          >
            {ctaLabel}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 rtl:rotate-180"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        )}
      </span>

      {/* Screen-reader text for the creative */}
      <span className="sr-only">{banner.title}</span>
    </Link>
  );
}
