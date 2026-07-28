import SectionTitle from "@/components/ui/SectionTitle";
import Banner from "../banner/Banner";
import ProductSlider from "../../productSlider/ProductSlider";
import { homePageService } from "../../services/homePageService";
import { toProductItem } from "../../utils";
import type { SectionFrontSetting, ApiBrandWithProducts, ApiProduct } from "../../types";

interface BrandProductsSectionProps {
  type: string;
  title?: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function BrandProductsSection({
  type,
  title,
  locale,
  setting,
  endpoint,
}: BrandProductsSectionProps) {
  if (!endpoint) return null;

  let brands: ApiBrandWithProducts[];
  try {
    if (type === "banners") {
      const banner = await homePageService.fetchSectionData<{
        id: number;
        title: string;
        slug: string;
        image: { desktop: string; mobile: string };
        status: boolean;
        products: ApiProduct[];
      }>(endpoint, locale);
      brands = [{
        id: banner.id,
        name: banner.title,
        slug: banner.slug,
        image: banner.image,
        status: banner.status,
        products: banner.products ?? [],
      }];
    } else {
      brands = await homePageService.fetchSectionData<ApiBrandWithProducts[]>(endpoint, locale);
    }
  } catch (error) {
    console.error("[BrandProductsSection] Failed to fetch brands:", error);
    return null;
  }

  if (!brands || brands.length === 0) return null;

  return (
    <div className="flex flex-col pb-4 overflow-hidden">
      {title && <SectionTitle title={title} />}
      <div className="flex flex-col gap-y-12">
        {brands.map((brand) => (
          <div key={brand.id} className="flex flex-col gap-y-4">
            <Banner promotion={brand} locale={locale} setting={setting} />
            {brand.products && brand.products.length > 0 && (
              <ProductSlider title={brand.name} items={brand.products.map(toProductItem)} columnsCount={setting?.columns_count} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
