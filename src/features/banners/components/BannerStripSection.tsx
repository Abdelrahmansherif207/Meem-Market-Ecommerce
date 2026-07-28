import { bannerService } from "../services/bannerService";
import BannerStripClient from "./BannerStripClient";
import type { Banner } from "../types";

interface BannerStripSectionProps {
  locale: string;
  title?: string;
}

export default async function BannerStripSection({ locale, title }: BannerStripSectionProps) {
  let banners: Banner[] = [];
  try {
    banners = await bannerService.getBanners(locale, 4);
  } catch (error) {
    console.warn("[BannerStripSection] Failed to fetch banners:", error);
    return null;
  }

  if (!banners.length) return null;

  return <BannerStripClient banners={banners} title={title} locale={locale} />;
}
