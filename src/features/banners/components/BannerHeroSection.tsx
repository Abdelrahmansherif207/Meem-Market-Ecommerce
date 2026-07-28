import { bannerService } from "../services/bannerService";
import BannerHeroClient from "./BannerHeroClient";
import type { Banner } from "../types";

interface BannerHeroSectionProps {
  locale: string;
}

export default async function BannerHeroSection({ locale }: BannerHeroSectionProps) {
  let banners: Banner[] = [];
  try {
    banners = await bannerService.getBanners(locale);
  } catch (error) {
    console.warn("[BannerHeroSection] Failed to fetch banners:", error);
    return null;
  }

  if (!banners.length) return null;

  const validBanners = banners.filter((b) => b.image?.desktop && b.image?.mobile);
  if (!validBanners.length) return null;

  return <BannerHeroClient banners={validBanners} />;
}
