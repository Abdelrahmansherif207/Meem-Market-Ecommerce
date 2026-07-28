import { brandService } from "../services/brandService";
import BrandsStripClient from "./BrandsStripClient";

interface BrandsStripSectionProps {
  locale: string;
  title?: string;
}

export default async function BrandsStripSection({ locale, title }: BrandsStripSectionProps) {
  let brands;
  try {
    brands = await brandService.getBrands(locale, 8);
  } catch (error) {
    console.warn("[BrandsStripSection] Failed to fetch brands:", error);
    return null;
  }

  if (!brands.length) return null;

  return <BrandsStripClient brands={brands} title={title} />;
}
