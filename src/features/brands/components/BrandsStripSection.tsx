import { homePageService } from "@/features/home/services/homePageService";
import { brandService } from "../services/brandService";
import BrandsStripClient from "./BrandsStripClient";
import type { SectionFrontSetting } from "@/features/home/types";
import type { Brand } from "../types";

interface BrandsStripSectionProps {
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function BrandsStripSection({
  locale,
  title,
  setting,
  endpoint,
}: BrandsStripSectionProps) {
  let brands;
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    brands = endpoint
      ? await homePageService.fetchSectionData<Brand[]>(endpoint, locale)
      : await brandService.getBrands(locale, 8);
  } catch (error) {
    console.warn("[BrandsStripSection] Failed to fetch brands:", error);
    return null;
  }

  if (!brands.length) return null;

  return (
    <BrandsStripClient brands={brands} title={title} columnsCount={setting?.columns_count} />
  );
}
