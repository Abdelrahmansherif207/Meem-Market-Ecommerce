import Image from "next/image";
import { homePageService } from "../services/homePageService";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, Promotion } from "../types";

interface CatchPromotionsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched promotions: wide `rounded-2xl` campaign images in a
 * responsive grid, following the screen's banner-block language.
 */
export default async function CatchPromotionsSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchPromotionsSectionProps) {
  let promotions: Promotion[] = [];
  try {
    promotions = endpoint
      ? normalizeList(
          await homePageService.fetchSectionData<Promotion[] | { data: Promotion[] }>(endpoint, locale),
        )
      : [];
  } catch (error) {
    console.warn("[CatchPromotionsSection] Failed to fetch promotions:", error);
    return null;
  }

  const valid = promotions.filter((p) => p.image?.desktop || p.image?.mobile);
  if (!valid.length) return null;

  return (
    <section className="w-full space-y-4">
      {title ? (
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {valid.slice(0, 2).map((promo) => (
          <a
            key={promo.id}
            href={promo.slug ? `/${locale}/promotions/${promo.slug}` : "#"}
            className="block w-full"
          >
            <Image
              src={promo.image.desktop || promo.image.mobile}
              alt={promo.name}
              width={1500}
              height={282}
              loading="lazy"
              className="aspect-auto w-full rounded-xl md:rounded-md"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
