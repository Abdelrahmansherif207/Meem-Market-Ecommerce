import { Suspense } from "react";
import type { HomePageSection, SectionFrontSetting } from "../types";
import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
import CatchHeroSliderSection from "./CatchHeroSliderSection";
import CatchBannerSection from "./CatchBannerSection";
import CatchProductShelfSection from "./CatchProductShelfSection";
import CatchFlashSaleSection from "./CatchFlashSaleSection";
// import CatchCategoriesSection from "./CatchCategoriesSection";
import CatchPromotionsSection from "./CatchPromotionsSection";
// import CatchTagsSection from "./CatchTagsSection";
import CatchBrandsSection from "./CatchBrandsSection";
import CatchCouponsSection from "./CatchCouponsSection";
import {
  CatchHeroSkeleton,
  CatchShelfSkeleton,
  CatchBannerSkeleton,
  // CatchCategoriesSkeleton,
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
      return <CatchHeroSliderSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "banners":
      return <CatchBannerSection endpoint={endpoint} locale={locale} title={title} setting={setting} />;
    case "products":
      return <CatchProductShelfSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "flash-sales":
      return <CatchFlashSaleSection title={title} type={type} locale={locale} setting={setting} endpoint={endpoint} />;
    // Categories section disabled by request — CMS "categories" sections render nothing.
    // case "categories":
    //   return <CatchCategoriesSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
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
      // "categories" and "tags" are intentionally disabled (commented above).
      if (type !== "categories" && type !== "tags") {
        console.warn(`[CatchSectionRenderer] Unknown section type: ${type}`);
      }
      return null;
  }
}

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "sliders":
      return <CatchHeroSkeleton />;
    case "banners":
      return <CatchBannerSkeleton />;
    case "products":
    case "flash-sales":
      return <CatchShelfSkeleton setting={setting} />;
    // Categories section disabled by request.
    // case "categories":
    //   return <CatchCategoriesSkeleton />;
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
