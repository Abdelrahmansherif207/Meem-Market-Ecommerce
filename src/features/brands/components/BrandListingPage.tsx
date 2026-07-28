import { brandService } from "../services/brandService";
import BrandListingClient from "./BrandListingClient";

interface BrandListingPageProps {
  locale: string;
}

export default async function BrandListingPage({ locale }: BrandListingPageProps) {
  let brands;
  try {
    brands = await brandService.getBrands(locale);
  } catch (error) {
    console.error("[BrandListingPage] Failed to fetch brands:", error);
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-text-secondary">Failed to load brands</p>
        <a
          href={`/${locale}`}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Retry
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Brands</h1>
      <BrandListingClient brands={brands} locale={locale} />
    </div>
  );
}
