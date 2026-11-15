import { Suspense } from "react";
import type { PromotionVideo } from "@/features/settings";
import type { HomePageSection, SectionFrontSetting } from "../types";
import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
import MeemHeroSection from "./MeemHeroSection";
import MeemHeroSliderSection from "./MeemHeroSliderSection";
import MeemBannerSection from "./MeemBannerSection";
import MeemProductShelfSection from "./MeemProductShelfSection";
import MeemFlashSaleSection from "./MeemFlashSaleSection";
import MeemCategoriesSection from "./MeemCategoriesSection";
import MeemPromotionsSection from "./MeemPromotionsSection";
import MeemTagsSection from "./MeemTagsSection";
import MeemBrandsSection from "./MeemBrandsSection";
import MeemCouponsSection from "./MeemCouponsSection";
import {
  MeemHeroSkeleton,
  MeemTagsSkeleton,
  MeemShelfSkeleton,
  MeemBannerSkeleton,
  MeemCategoriesSkeleton,
  MeemBrandsSkeleton,
  MeemPromotionsSkeleton,
  MeemCouponsSkeleton,
} from "./skeletons";

function MeemSectionBlock({
  section,
  locale,
  promotionVideo,
}: {
  section: HomePageSection;
  locale: string;
  promotionVideo?: PromotionVideo | null;
}) {
  const { type, title, endpoint } = section;
  // Older CMS rows can store `front` as an empty array; treat that as no settings.
  const setting = Array.isArray(section.setting?.front)
    ? undefined
    : section.setting?.front;

  switch (type) {
    case "hero":
      return (
        <MeemHeroSection
          locale={locale}
          title={title}
          setting={setting}
          promotionVideo={promotionVideo}
        />
      );
    case "sliders":
      return <MeemHeroSliderSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "banners":
      return <MeemBannerSection endpoint={endpoint} locale={locale} title={title} setting={setting} />;
    case "products":
      return <MeemProductShelfSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "flash-sales":
      return <MeemFlashSaleSection title={title} type={type} locale={locale} setting={setting} endpoint={endpoint} />;
    case "categories":
      return <MeemCategoriesSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "promotions":
      return <MeemPromotionsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "tags":
      return <MeemTagsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <MeemBrandsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "coupons":
      return <MeemCouponsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      console.warn(`[MeemSectionRenderer] Unknown section type: ${type}`);
      return null;
  }
}

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "hero":
      return <MeemHeroSkeleton />;
    case "sliders":
      return <MeemHeroSkeleton variant="sliders" />;
    case "tags":
      return <MeemTagsSkeleton />;
    case "banners":
      return <MeemBannerSkeleton />;
    case "products":
    case "flash-sales":
      return <MeemShelfSkeleton setting={setting} />;
    case "categories":
      return <MeemCategoriesSkeleton setting={setting} />;
    case "brands":
      return <MeemBrandsSkeleton />;
    case "promotions":
      return <MeemPromotionsSkeleton />;
    case "coupons":
      return <MeemCouponsSkeleton />;
    default:
      return null;
  }
}

/**
 * Screen-matched replacement for the shared SectionSuspense: same
 * streaming + error-boundary pattern, Meem design components.
 */
export function MeemSectionSuspense({
  section,
  locale,
  promotionVideo,
}: {
  section: HomePageSection;
  locale: string;
  promotionVideo?: PromotionVideo | null;
}) {
  return (
    <Suspense key={section.id} fallback={getSectionSkeleton(section.type, section.setting?.front)}>
      <SectionErrorBoundary>
        <MeemSectionBlock
          section={section}
          locale={locale}
          promotionVideo={promotionVideo}
        />
      </SectionErrorBoundary>
    </Suspense>
  );
}
