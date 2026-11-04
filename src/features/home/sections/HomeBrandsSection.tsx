import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import type { Brand } from "@/features/brands/types";
import { brandService } from "@/features/brands/services/brandService";

import HomeSectionHeader from "./HomeSectionHeader";
import { normalizeList } from "./mappers";
import { homePageService } from "../services/homePageService";

interface HomeBrandsSectionProps {
  title: string;
  locale: string;
  endpoint?: string;
}

/**
 * Stitch "Iconic Global & Niche Brands": an 8-wide grid of rectangular
 * logo tiles (h-20, white surface, warm hairline, ambient hover lift).
 * Tiles show the real brand logo from the brands API and link to the
 * existing brand detail route.
 */
export default async function HomeBrandsSection({
  title,
  locale,
  endpoint,
}: HomeBrandsSectionProps) {
  let brands: Brand[] = [];
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    brands = endpoint
      ? normalizeList<Brand>(
          await homePageService.fetchSectionData<unknown>(endpoint, locale),
        )
      : await brandService.getBrands(locale, 8);
  } catch (error) {
    console.warn("[HomeBrandsSection] Failed to fetch brands:", error);
    return null;
  }

  const valid = brands.filter((b) => b.image?.desktop || b.image?.mobile);
  if (!valid.length) return null;

  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="home-container">
      <HomeSectionHeader
        title={title}
        action={
          <Link
            href="/brands"
            className="text-[11px] font-bold uppercase tracking-wider text-(--home-ink) transition-colors hover:text-[#d88b97]"
          >
            {t("viewAll")} →
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {valid.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="home-brand-tile flex h-20 items-center justify-center p-2.5"
          >
            <Image
              src={brand.image.desktop || brand.image.mobile}
              alt={brand.name}
              width={160}
              height={160}
              className="max-h-full max-w-full object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
