import Image from "next/image";
import { homePageService } from "../services/homePageService";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, ApiBrandWithProducts } from "../types";

interface CatchBrandsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched brands section: white rounded-2xl logo tiles linking to
 * each brand page.
 */
export default async function CatchBrandsSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchBrandsSectionProps) {
  void setting;

  let brands: ApiBrandWithProducts[] = [];
  try {
    brands = normalizeList(
      await homePageService.fetchSectionData<ApiBrandWithProducts[] | { data: ApiBrandWithProducts[] }>(endpoint!, locale),
    );
  } catch (error) {
    console.warn("[CatchBrandsSection] Failed to fetch brands:", error);
    return null;
  }

  const valid = brands.filter((b) => b.image?.desktop || b.image?.mobile);
  if (!valid.length) return null;

  return (
    <section className="w-full space-y-4">
      {title ? (
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {valid.slice(0, 6).map((brand) => (
          <a
            key={brand.id}
            href={`/${locale}/brands/${brand.slug}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <Image
              src={brand.image.desktop || brand.image.mobile}
              alt={brand.name}
              width={96}
              height={96}
              className="h-20 w-20 object-contain transition-transform group-hover:scale-105"
            />
            <span className="line-clamp-1 text-xs font-bold uppercase tracking-wide text-neutral-900 transition-colors group-hover:text-primary">
              {brand.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
