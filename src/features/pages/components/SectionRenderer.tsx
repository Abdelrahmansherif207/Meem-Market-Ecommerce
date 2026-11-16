import { Suspense } from "react";
import { SectionSkeleton } from "@/components/ui/PageSkeleton";
import type { HomePageSection } from "@/features/home/types";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import FlashSaleSection from "@/features/home/components/cardSlider/FlashSaleSection";
import ContentSection from "@/features/home/components/contentSection/ContentSection";
import ProductSliderSection from "@/features/home/productSlider/ProductSliderSection";
import FeaturedCategories from "@/features/home/components/featuredCategories/FeaturedCategories";
import PromotionsSection from "@/features/promotions/components/PromotionsSection";
import BrandsStripSection from "@/features/brands/components/BrandsStripSection";
import { CouponsVouchersSection } from "@/features/coupons";
import BannerHeroSection from "@/features/banners/components/BannerHeroSection";
import BannerSection from "@/features/banners/components/BannerSection";
import BannerStripSection from "@/features/banners/components/BannerStripSection";
import SliderHeroSection from "@/features/sliders/components/SliderHeroSection";
import FlashSaleBannerSection from "@/features/flash-sales/components/FlashSaleBannerSection";
import EndingSoonSection from "@/features/flash-sales/components/EndingSoonSection";
import { TagsBannerSection } from "@/features/tags";

function SectionBlock({
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
      return <SliderHeroSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "banners_hero":
      return <BannerHeroSection locale={locale} />;
    case "banners_strip":
      return <BannerStripSection locale={locale} title={title} />;
    case "promotions":
      return <PromotionsSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <BrandsStripSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "flash-sale":
      return <FlashSaleBannerSection locale={locale} />;
    case "ending_today":
      return <EndingSoonSection locale={locale} period="today" />;
    case "ending_this_week":
      return <EndingSoonSection locale={locale} period="week" />;
    case "flash-sales":
      return <FlashSaleSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "coupons":
      return <CouponsVouchersSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "categories":
      return <ContentSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "products":
      return <ProductSliderSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    case "banners":
      return <BannerSection endpoint={endpoint} locale={locale} title={title} setting={setting} />;
    case "featured_categories":
      return <FeaturedCategories locale={locale} />;
    case "tags":
      return <TagsBannerSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      console.warn(`[SectionRenderer] Unknown section type: ${type}`);
      return null;
  }
}

export function SectionSuspense({
  section,
  locale,
}: {
  section: HomePageSection;
  locale: string;
}) {
  return (
    <Suspense key={section.id} fallback={<SectionSkeleton />}>
      <SectionErrorBoundary>
        <SectionBlock section={section} locale={locale} />
      </SectionErrorBoundary>
    </Suspense>
  );
}
