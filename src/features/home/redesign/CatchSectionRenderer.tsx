import { Suspense } from "react";
import type { PromotionVideo } from "@/features/settings";
import type { HomePageSection, SectionFrontSetting } from "../types";
import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
import CatchHeroSection from "./CatchHeroSection";
import CatchHeroSliderSection from "./CatchHeroSliderSection";
import CatchBannerSection from "./CatchBannerSection";
import CatchProductShelfSection from "./CatchProductShelfSection";
import CatchFlashSaleSection from "./CatchFlashSaleSection";
import CatchCategoriesSection from "./CatchCategoriesSection";
import CatchPromotionsSection from "./CatchPromotionsSection";
import CatchTagsSection from "./CatchTagsSection";
import CatchBrandsSection from "./CatchBrandsSection";
import CatchCouponsSection from "./CatchCouponsSection";
import {
  CatchHeroSkeleton,
  CatchTagsSkeleton,
  CatchShelfSkeleton,
  CatchBannerSkeleton,
  CatchCategoriesSkeleton,
  CatchBrandsSkeleton,
  CatchPromotionsSkeleton,
  CatchCouponsSkeleton,
} from "./skeletons";

function CatchSectionBlock({
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
        <CatchHeroSection
          locale={locale}
          title={title}
          setting={setting}
          promotionVideo={promotionVideo}
        />
      );
    case "sliders":
      return <CatchHeroSliderSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "banners":
      return <CatchBannerSection endpoint={endpoint} locale={locale} title={title} setting={setting} />;
    case "products":
      return <CatchProductShelfSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "flash-sales":
      return <CatchFlashSaleSection title={title} type={type} locale={locale} setting={setting} endpoint={endpoint} />;
    case "categories":
      return <CatchCategoriesSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "promotions":
      return <CatchPromotionsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "tags":
      return <CatchTagsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <CatchBrandsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "coupons":
      return <CatchCouponsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      console.warn(`[CatchSectionRenderer] Unknown section type: ${type}`);
      return null;
  }
}

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "hero":
      return <CatchHeroSkeleton />;
    case "sliders":
      return <CatchHeroSkeleton variant="sliders" />;
    case "tags":
      return <CatchTagsSkeleton />;
    case "banners":
      return <CatchBannerSkeleton />;
    case "products":
    case "flash-sales":
      return <CatchShelfSkeleton setting={setting} />;
    case "categories":
      return <CatchCategoriesSkeleton setting={setting} />;
    case "brands":
      return <CatchBrandsSkeleton />;
    case "promotions":
      return <CatchPromotionsSkeleton />;
    case "coupons":
      return <CatchCouponsSkeleton />;
    default:
      return null;
  }
}

/**
 * Screen-matched replacement for the shared SectionSuspense: same
 * streaming + error-boundary pattern, Catch design components.
 */
export function CatchSectionSuspense({
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
        <CatchSectionBlock
          section={section}
          locale={locale}
          promotionVideo={promotionVideo}
        />
      </SectionErrorBoundary>
    </Suspense>
  );
}
