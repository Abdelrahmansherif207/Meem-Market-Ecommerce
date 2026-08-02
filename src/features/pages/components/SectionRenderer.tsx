import { Suspense } from "react";
import type { HomePageSection, SectionFrontSetting } from "@/features/home/types";
import FlashSaleSection from "@/features/home/components/cardSlider/FlashSaleSection";
import ContentSection from "@/features/home/components/contentSection/ContentSection";
import ProductSliderSection from "@/features/home/productSlider/ProductSliderSection";
import FeaturedCategories from "@/features/home/components/featuredCategories/FeaturedCategories";
import PromotionsSection from "@/features/promotions/components/PromotionsSection";
import BrandsStripSection from "@/features/brands/components/BrandsStripSection";
import FlashSalesSkeleton from "@/features/home/components/skeletons/FlashSalesSkeleton";
import ContentSectionSkeleton from "@/features/home/components/skeletons/ContentSectionSkeleton";
import ProductSliderSkeleton from "@/features/home/components/skeletons/ProductSliderSkeleton";
import PromotionsSectionSkeleton from "@/features/promotions/components/PromotionsSectionSkeleton";
import BrandsStripSkeleton from "@/features/brands/components/skeletons/BrandsStripSkeleton";
import BannerHeroSection from "@/features/banners/components/BannerHeroSection";
import BannerSection from "@/features/banners/components/BannerSection";
import BannerStripSection from "@/features/banners/components/BannerStripSection";
import BannerHeroSkeleton from "@/features/banners/components/BannerHeroSkeleton";
import BannerStripSkeleton from "@/features/banners/components/BannerStripSkeleton";
import SliderHeroSection from "@/features/sliders/components/SliderHeroSection";
import SliderHeroSkeleton from "@/features/sliders/components/SliderHeroSkeleton";
import FlashSaleBannerSection from "@/features/flash-sales/components/FlashSaleBannerSection";
import EndingSoonSection from "@/features/flash-sales/components/EndingSoonSection";
import FlashSaleBannerSkeleton from "@/features/flash-sales/components/FlashSaleBannerSkeleton";
import EndingSoonSkeleton from "@/features/flash-sales/components/EndingSoonSkeleton";
import { TagsBannerSection } from "@/features/tags";
import TagsBannerSkeleton from "@/features/tags/components/skeletons/TagsBannerSkeleton";

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
      return <SliderHeroSection locale={locale} />;
    case "banners_hero":
      return <BannerHeroSection locale={locale} />;
    case "banners_strip":
      return <BannerStripSection locale={locale} title={title} />;
    case "promotions":
      return <PromotionsSection locale={locale} />;
    case "brands":
      return <BrandsStripSection locale={locale} title={title} />;
    case "flash-sale":
      return <FlashSaleBannerSection locale={locale} />;
    case "ending_today":
      return <EndingSoonSection locale={locale} period="today" />;
    case "ending_this_week":
      return <EndingSoonSection locale={locale} period="week" />;
    case "flash-sales":
    case "coupons":
      return <FlashSaleSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
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

function getSectionSkeleton(type: string, setting?: SectionFrontSetting): React.ReactNode {
  switch (type) {
    case "sliders":
      return <SliderHeroSkeleton />;
    case "banners_hero":
      return <BannerHeroSkeleton />;
    case "banners_strip":
      return <BannerStripSkeleton />;
    case "promotions":
      return <PromotionsSectionSkeleton />;
    case "brands":
      return <BrandsStripSkeleton />;
    case "flash-sale":
      return <FlashSaleBannerSkeleton />;
    case "ending_today":
    case "ending_this_week":
      return <EndingSoonSkeleton />;
    case "flash-sales":
    case "coupons":
      return <FlashSalesSkeleton type={type} setting={setting} />;
    case "categories":
      return <ContentSectionSkeleton setting={setting} />;
    case "products":
      return <ProductSliderSkeleton />;
    case "banners":
      return <BannerHeroSkeleton />;
    case "tags":
      return <TagsBannerSkeleton />;
    default:
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
    <Suspense key={section.id} fallback={getSectionSkeleton(section.type, section.setting?.front)}>
      <SectionBlock section={section} locale={locale} />
    </Suspense>
  );
}

export function PageSkeleton({ sections = 4 }: { sections?: number }) {
  const types = ["sliders", "promotions", "categories", "products"];
  return (
    <main className="flex flex-col gap-y-5">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i}>
          {getSectionSkeleton(types[i % types.length])}
        </div>
      ))}
    </main>
  );
}
