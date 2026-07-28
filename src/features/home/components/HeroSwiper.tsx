import { homePageService } from "../services/homePageService";
import HeroSwiperClient from "./HeroSwiperClient";
import type { HeroBanner, HeroSwiperProps } from "../types";

export default async function HeroSwiper({ endpoint, locale, title, setting }: HeroSwiperProps) {
  if (!endpoint) return null;

  let banners: HeroBanner[] = [];
  try {
    banners = await homePageService.fetchSectionData<HeroBanner[]>(endpoint, locale);
  } catch (error) {
    console.error("[HeroSwiper] Failed to fetch banners:", error);
    return null;
  }

  if (!banners || banners.length === 0) return null;

  const validBanners = banners.filter(
    (b) => b.image?.desktop && b.image?.mobile
  );
  if (validBanners.length === 0) return null;

  return <HeroSwiperClient banners={validBanners} title={title} setting={setting} />;
}
