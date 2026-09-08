import Banner from "../banner/Banner";
import BrandProductsIsland from "./BrandProductsIsland";
import { homePageService } from "../../services/homePageService";
import { toProductItem } from "../../utils";
import type { SectionFrontSetting, ApiBrandWithProducts, ApiProduct, ProductItem } from "../../types";

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
    <BrandProductsIsland
      key={`${type}:${endpoint}`}
      fetchKind={type === "banners" ? "banners" : "brands"}
      endpoint={endpoint}
      locale={locale}
      title={title}
      columnsCount={setting?.columns_count}
      initialBlocks={brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        banner: (
          <Banner
            key={brand.id}
            promotion={brand}
            locale={locale}
            setting={setting}
          />
        ),
      }))}
      initialItemsByBrand={Object.fromEntries(
        brands.map((brand) => [
          brand.id,
          (brand.products ?? []).map(toProductItem),
        ]),
      ) as Record<number, ProductItem[]>}
    />
  );
}
