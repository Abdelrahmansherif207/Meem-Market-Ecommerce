import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/shared/utils/cn";
import { homePageService } from "../services/homePageService";
import { resolveLocalizedText } from "../utils";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, Promotion } from "../types";

interface CatchPromotionsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

const PROMO_MEDIA_STYLE = {
  "--media-aspect": "1500 / 282",
  "--media-aspect-mobile": "1500 / 282",
} as CSSProperties;

/**
 * Catch Beauty promotions: every valid CMS promotion in a two-column grid,
 * full-bleed on the warm page canvas with no card chrome. Each tile reserves
 * the artwork aspect so the wide campaign images are never cropped. When the
 * count is odd, the last tile spans both columns.
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
          await homePageService.fetchSectionData<
            Promotion[] | { data: Promotion[] }
          >(endpoint, locale),
        )
      : [];
  } catch (error) {
    console.warn("[CatchPromotionsSection] Failed to fetch promotions:", error);
    return null;
  }

  const valid = promotions.filter((p) => p.image?.desktop || p.image?.mobile);
  if (!valid.length) return null;

  const lastIndex = valid.length - 1;
  const lastSpansBoth = valid.length % 2 === 1;
  const showTitle = setting?.show_title !== false;
  const subtitle = resolveLocalizedText(setting?.subtitle, locale);

  return (
    <section className="w-full space-y-4">
      {showTitle ? (
        <SectionHeader title={title} subtitle={subtitle} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {valid.map((promo, index) => {
          const isWide = lastSpansBoth && index === lastIndex;
          const content = (
            <div className="catch-media-well rounded-xl" style={PROMO_MEDIA_STYLE}>
              <CampaignImage
                desktop={promo.image.desktop || promo.image.mobile}
                mobile={promo.image.mobile}
                alt={promo.name}
                width={1500}
                height={282}
                mobileWidth={1500}
                mobileHeight={282}
                sizes={
                  isWide
                    ? "100vw"
                    : "(max-width: 639px) 100vw, 50vw"
                }
                fill
                className="object-contain"
              />
            </div>
          );

          const tileClass = cn(
            "block rounded-xl focus-visible:outline-offset-2",
            isWide && "sm:col-span-2",
          );

          return promo.slug ? (
            <Link
              key={promo.id}
              href={`/promotions/${promo.slug}`}
              className={tileClass}
            >
              {content}
            </Link>
          ) : (
            <div key={promo.id} className={tileClass}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
