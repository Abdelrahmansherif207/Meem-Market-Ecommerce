import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/shared/utils/cn";
import { homePageService } from "../services/homePageService";
import { resolveLocalizedText } from "../utils";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, ApiBrandWithProducts } from "../types";

interface CatchBrandsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Catch Beauty brand rail/grid: every brand the CMS returns, using the
 * section's `columns_count` on desktop, with a real "View all" destination.
 */
export default async function CatchBrandsSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchBrandsSectionProps) {
  if (!endpoint) return null;
  const t = await getTranslations("catchHome");

  let brands: ApiBrandWithProducts[] = [];
  try {
    brands = normalizeList(
      await homePageService.fetchSectionData<
        ApiBrandWithProducts[] | { data: ApiBrandWithProducts[] }
      >(endpoint, locale),
    );
  } catch (error) {
    console.warn("[CatchBrandsSection] Failed to fetch brands:", error);
    return null;
  }

  const valid = brands.filter((b) => b.image?.desktop || b.image?.mobile);
  if (!valid.length) return null;

  // Respect the CMS cap without leaving empty columns when the merchant
  // selected fewer brands than the configured column count.
  const desktopColumns = Math.max(
    2,
    Math.min(8, Math.round(setting?.columns_count ?? 6), valid.length),
  );

  const showTitle = setting?.show_title !== false;
  const subtitle = resolveLocalizedText(setting?.subtitle, locale);
  const showViewAll = setting?.show_view_all !== false;
  const actionLabel = resolveLocalizedText(
    setting?.action_label,
    locale,
    t("viewAll"),
  );
  const actionHref = setting?.action_href?.trim() || "/brands";
  const isList = setting?.layout === "list";

  return (
    <section className="w-full space-y-4">
      {showTitle ? (
        <SectionHeader
          title={title}
          subtitle={subtitle}
          actionLabel={showViewAll ? actionLabel : undefined}
          actionHref={showViewAll ? actionHref : undefined}
        />
      ) : null}

      <div
        className={cn(
          isList ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "catch-cms-grid",
        )}
        style={
          isList
            ? undefined
            : ({
                "--cms-cols-mobile": 2,
                "--cms-cols-tablet": 4,
                "--cms-cols-desktop": desktopColumns,
              } as CSSProperties)
        }
      >
        {valid.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className={cn(
              "group flex items-center rounded-2xl border border-catch-border-soft bg-white p-3 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-elev-2 sm:p-4",
              isList
                ? "flex-row justify-start gap-3 text-start"
                : "flex-col justify-center gap-2",
            )}
          >
            <div
              className={cn(
                "relative shrink-0",
                isList ? "h-12 w-12" : "aspect-[4/3] w-full",
              )}
            >
              <CampaignImage
                desktop={brand.image.desktop || brand.image.mobile}
                mobile={brand.image.mobile}
                alt={brand.name}
                width={320}
                height={240}
                mobileWidth={320}
                mobileHeight={240}
                sizes={
                  isList
                    ? "48px"
                    : "(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 12.5vw"
                }
                fill
                className={cn(
                  "object-contain transition-transform duration-300 group-hover:scale-[1.04]",
                  isList ? "p-0" : "p-2 sm:p-3",
                )}
              />
            </div>
            <span
              className={cn(
                "line-clamp-1 text-[10px] font-bold uppercase tracking-[0.08em] text-catch-charcoal transition-colors group-hover:text-primary sm:text-xs",
                isList ? "text-start" : "text-center",
              )}
            >
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
