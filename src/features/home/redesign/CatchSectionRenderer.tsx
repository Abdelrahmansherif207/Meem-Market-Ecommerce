import { Suspense } from "react";
import type { HomePageSection, SectionFrontSetting } from "../types";
import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
// CMS hero carousel is temporarily replaced by CatchHeroVideoSection.
// import CatchHeroSliderSection from "./CatchHeroSliderSection";
import CatchBannerSection from "./CatchBannerSection";
import CatchProductShelfSection from "./CatchProductShelfSection";
import CatchFlashSaleSection from "./CatchFlashSaleSection";
import CatchCategoriesSection from "./CatchCategoriesSection";
import CatchPromotionsSection from "./CatchPromotionsSection";
// Tags section stays disabled by request — CMS "tags" sections render nothing.
// import CatchTagsSection from "./CatchTagsSection";
import CatchBrandsSection from "./CatchBrandsSection";
import CatchCouponsSection from "./CatchCouponsSection";
import {
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
}: {
  section: HomePageSection;
  locale: string;
}) {
  const { type, title, endpoint } = section;
  const setting = section.setting?.front;

  switch (type) {
    case "sliders":
      // Temporarily replaced by CatchHeroVideoSection in HomePage.
      return null;
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
    // Tags section disabled by request — CMS "tags" sections render nothing.
    // case "tags":
    //   return <CatchTagsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <CatchBrandsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "coupons":
      return <CatchCouponsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      // "tags" is intentionally disabled (commented above).
      if (type !== "tags") {
        console.warn(`[CatchSectionRenderer] Unknown section type: ${type}`);
      }
      return null;
  }
}

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "sliders":
      // No skeleton: the sliders case renders nothing while the video hero is active.
      return null;
    case "banners":
      return <CatchBannerSkeleton />;
    case "products":
    case "flash-sales":
      return <CatchShelfSkeleton setting={setting} />;
    case "categories":
      return <CatchCategoriesSkeleton />;
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
}: {
  section: HomePageSection;
  locale: string;
}) {
  return (
    <Suspense key={section.id} fallback={getSectionSkeleton(section.type, section.setting?.front)}>
      <SectionErrorBoundary>
        <CatchSectionBlock section={section} locale={locale} />
      </SectionErrorBoundary>
    </Suspense>
  );
}
