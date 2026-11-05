import HomeSectionHeader from "./HomeSectionHeader";
import HomeProductRail from "./clients/HomeProductRail";
import {
  CampaignBannerCreative,
  fetchHomeBanner,
} from "./HomeBannerSection";
import { bannerProductToItem } from "./mappers";
import { getTranslations } from "next-intl/server";
import type { ProductItem, SectionFrontSetting } from "../types";

interface HomeCampaignPairProps {
  locale: string;
  banners: {
    key: number;
    title: string;
    endpoint?: string;
    setting?: SectionFrontSetting;
  }[];
}

/**
 * Stitch "High-Impact Dual Campaign Banners": when the CMS manifest emits
 * two consecutive `banners` sections, they render side by side in one
 * dark + blush grid (each creative fetched independently, alternating
 * variants), followed by each banner's real product rail.
 */
export default async function HomeCampaignPair({
  locale,
  banners,
}: HomeCampaignPairProps) {
  const pair = await Promise.all(
    banners.map((b) => fetchHomeBanner(locale, b.endpoint)),
  );

  const [a, b] = pair;
  if (!a && !b) return null;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="home-container">
      <div
        className={
          a && b
            ? "grid grid-cols-1 gap-6 md:grid-cols-2"
            : "grid grid-cols-1"
        }
      >
        {[
          { banner: a, cfg: banners[0], variant: "dark" as const },
          { banner: b, cfg: banners[1], variant: "blush" as const },
        ]
          .filter((item) => item.banner)
          .map((item) => (
            <CampaignBannerCreative
              key={item.cfg!.key}
              banner={item.banner!}
              variant={item.variant}
              eyebrow={item.cfg!.title}
              ctaLabel={t("shopNow")}
            />
          ))}
      </div>

      {pair.map((banner, index) => {
        const cfg = banners[index];
        if (!banner) return null;
        const products: ProductItem[] = (banner.products ?? []).map(
          bannerProductToItem,
        );
        if (!products.length) return null;
        return (
          <div key={cfg.key} className="mt-6">
            <HomeSectionHeader title={cfg.title} />
            <HomeProductRail
              items={products}
              fetchKind="banner"
              endpoint={cfg.endpoint}
              locale={locale}
              initialCurrency={products[0]?.currency?.code}
              columnsCount={cfg.setting?.columns_count ?? 5}
              badgeText={cfg.setting?.badge_text}
              autoplay={cfg.setting?.autoplay}
              sliderSpeed={cfg.setting?.slider_speed}
            />
          </div>
        );
      })}
    </section>
  );
}
