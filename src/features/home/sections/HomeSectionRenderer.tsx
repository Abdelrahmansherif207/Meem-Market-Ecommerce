import { Suspense, type ReactNode } from "react";

import { SectionErrorBoundary } from "@/features/pages/components/SectionErrorBoundary";
import BannerHeroSection from "@/features/banners/components/BannerHeroSection";
import BannerStripSection from "@/features/banners/components/BannerStripSection";
import PromotionsSection from "@/features/promotions/components/PromotionsSection";
import PromotionsSectionSkeleton from "@/features/promotions/components/PromotionsSectionSkeleton";
import {
  CouponsVouchersSection,
  CouponsVouchersSkeleton,
} from "@/features/coupons";
import { TagsBannerSection } from "@/features/tags";

import HomeHeroSliderSection from "./HomeHeroSliderSection";
import HomeBannerSection from "./HomeBannerSection";
import HomeCampaignPair from "./HomeCampaignPair";
import HomeBrandsSection from "./HomeBrandsSection";
import HomeDepartmentsSection from "./HomeDepartmentsSection";
import {
  HomeFlashBannerSection,
  HomeEndingSoonSection,
  HomeFlashSalesSection,
} from "./HomeFlashSections";
import HomeProductRailSection from "./HomeProductRailSection";
import {
  HomeBannerSkeleton,
  HomeFlashSkeleton,
  HomeHeroSkeleton,
  HomeRailSkeleton,
  HomeRingsSkeleton,
} from "./skeletons";
import type { HomePageSection, SectionFrontSetting } from "../types";

/**
 * Homepage-owned section renderer (Stitch design variants).
 *
 * Same CMS contract as the shared `features/pages` renderer — identical
 * section types, endpoints, ordering and settings — but every type maps
 * to a homepage-only component. Global files are untouched.
 */

/**
 * Temporarily disabled homepage sections (commented out per product
 * decision):
 * - `categories` / `featured_categories` → "Shop by Department" tiles
 * - `tags` → Popular Tags chips
 * The components remain in the codebase; remove a type from this set to
 * render its section again (nothing else needs to change).
 */
const DISABLED_SECTION_TYPES = new Set([
  "categories",
  "featured_categories",
  "tags",
]);

function HomeSectionBlock({
  section,
  locale,
}: {
  section: HomePageSection;
  locale: string;
}) {
  const { type, title, endpoint } = section;
  const setting = section.setting?.front;

  if (DISABLED_SECTION_TYPES.has(type)) {
    // [ temporarily commented out on the homepage ]
    return null;
  }

  switch (type) {
    case "sliders":
      return <HomeHeroSliderSection locale={locale} endpoint={endpoint} setting={setting} />;
    case "banners_hero":
      return <BannerHeroSection locale={locale} />;
    case "banners_strip":
      return <BannerStripSection locale={locale} title={title} />;
    case "banners":
      return (
        <HomeBannerSection
          endpoint={endpoint}
          locale={locale}
          title={title}
          setting={setting}
          variant="dark"
        />
      );
    case "promotions":
      return <PromotionsSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "brands":
      return <HomeBrandsSection title={title} locale={locale} endpoint={endpoint} />;
    case "flash-sale":
      return <HomeFlashBannerSection locale={locale} />;
    case "ending_today":
      return <HomeEndingSoonSection title={title} locale={locale} period="today" />;
    case "ending_this_week":
      return <HomeEndingSoonSection title={title} locale={locale} period="week" />;
    case "flash-sales":
      return <HomeFlashSalesSection title={title} locale={locale} endpoint={endpoint} setting={setting} />;
    case "coupons":
      return <CouponsVouchersSection locale={locale} title={title} setting={setting} endpoint={endpoint} />;
    case "categories":
      return <HomeDepartmentsSection type={type} title={title} locale={locale} endpoint={endpoint} setting={setting} />;
    case "featured_categories":
      return <HomeDepartmentsSection type={type} title={title} locale={locale} endpoint={endpoint} setting={setting} />;
    case "products":
      return <HomeProductRailSection title={title} locale={locale} endpoint={endpoint} setting={setting} />;
    case "tags":
      return <TagsBannerSection type={type} title={title} locale={locale} setting={setting} endpoint={endpoint} />;
    default:
      console.warn(`[HomeSectionRenderer] Unknown section type: ${type}`);
      return null;
  }
}

function getHomeSkeleton(
  type: string,
  setting?: SectionFrontSetting,
): ReactNode {
  switch (type) {
    case "sliders":
    case "banners_hero":
      return <HomeHeroSkeleton />;
    case "banners_strip":
    case "banners":
      return <HomeBannerSkeleton />;
    case "promotions":
      return <PromotionsSectionSkeleton setting={setting} />;
    case "brands":
      return <HomeRingsSkeleton />;
    case "flash-sale":
    case "ending_today":
    case "ending_this_week":
    case "flash-sales":
      return <HomeFlashSkeleton />;
    case "coupons":
      return <CouponsVouchersSkeleton />;
    case "categories":
    case "featured_categories":
    case "tags":
      // Temporarily disabled sections — no streaming skeleton either.
      return null;
    case "products":
      return <HomeRailSkeleton />;
    default:
      return null;
  }
}

export function HomeSectionSuspense({
  section,
  locale,
}: {
  section: HomePageSection;
  locale: string;
}) {
  return (
    <Suspense
      key={section.id}
      fallback={getHomeSkeleton(section.type, section.setting?.front)}
    >
      <SectionErrorBoundary>
        <HomeSectionBlock section={section} locale={locale} />
      </SectionErrorBoundary>
    </Suspense>
  );
}

/** Two consecutive `banners` sections stream together as one campaign grid. */
export function HomePairedBannersSuspense({
  sections,
  locale,
}: {
  sections: HomePageSection[];
  locale: string;
}) {
  return (
    <Suspense
      key={`banners-pair-${sections[0].id}`}
      fallback={<HomeBannerSkeleton />}
    >
      <SectionErrorBoundary>
        <HomeCampaignPair
          locale={locale}
          banners={sections.map((s) => ({
            key: s.id,
            title: s.title,
            endpoint: s.endpoint,
            setting: s.setting?.front,
          }))}
        />
      </SectionErrorBoundary>
    </Suspense>
  );
}

/* ── Grouping: consecutive same-type `banners` merge into one block ───── */

export interface SectionGroup {
  type: string;
  sections: HomePageSection[];
}

export function groupSections(sections: HomePageSection[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  for (const section of sections) {
    const last = groups[groups.length - 1];
    if (last && last.type === "banners" && section.type === "banners") {
      last.sections.push(section);
    } else {
      groups.push({ type: section.type, sections: [section] });
    }
  }
  return groups;
}
