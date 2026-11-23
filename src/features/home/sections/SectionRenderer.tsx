import { Suspense } from "react";
import type { PromotionVideo } from "@/features/settings";
import type { HomePageSection, SectionFrontSetting } from "../types";
import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
import HeroSection from "./HeroSection";
import HeroSliderSection from "./HeroSliderSection";
import BannerSection from "./BannerSection";
import ProductShelfSection from "./ProductShelfSection";
import FlashSaleSection from "./FlashSaleSection";
import CategoriesSection from "./CategoriesSection";
import PromotionsSection from "./PromotionsSection";
import TagsSection from "./TagsSection";
import BrandsSection from "./BrandsSection";
import CouponsSection from "./CouponsSection";
import {
  HeroSkeleton,
  TagsSkeleton,
  ShelfSkeleton,
  BannerSkeleton,
  CategoriesSkeleton,
  BrandsSkeleton,
  PromotionsSkeleton,
  CouponsSkeleton,
} from "./skeletons";

function SectionBlock({
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
        <HeroSection
          locale={locale}
          title={title}
          setting={setting}
          promotionVideo={promotionVideo}
        />
      );
    case "sliders":
      return <HeroSliderSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "banners":
      return (
        <BannerSection
          endpoint={endpoint}
          locale={locale}
          title={title}
          setting={setting}
          back={section.setting?.back}
        />
      );
    case "products":
      return <ProductShelfSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "flash-sales":
      return <FlashSaleSection title={title} type={type} locale={locale} setting={setting} endpoint={endpoint} />;
    case "categories":
      return <CategoriesSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "promotions":
      return <PromotionsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "tags":
      return <TagsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <BrandsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "coupons":
      return <CouponsSection title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      console.warn(`[SectionRenderer] Unknown section type: ${type}`);
      return null;
  }
}

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "hero":
      return <HeroSkeleton />;
    case "sliders":
      return <HeroSkeleton variant="sliders" />;
    case "tags":
      return <TagsSkeleton />;
    case "banners":
      return <BannerSkeleton />;
    case "products":
    case "flash-sales":
      return <ShelfSkeleton setting={setting} />;
    case "categories":
      return <CategoriesSkeleton setting={setting} />;
    case "brands":
      return <BrandsSkeleton setting={setting} />;
    case "promotions":
      return <PromotionsSkeleton />;
    case "coupons":
      return <CouponsSkeleton />;
    default:
      return null;
  }
}

/**
 * Streaming + error-boundary wrapper shared by the home page and CMS pages.
 */
export function SectionSuspense({
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
        <SectionBlock
          section={section}
          locale={locale}
          promotionVideo={promotionVideo}
        />
      </SectionErrorBoundary>
    </Suspense>
  );
}
