import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/shared/utils/cn";
import { homePageService } from "../services/homePageService";
import { resolveLocalizedText } from "../utils";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, HomeCategory } from "../types";

interface CatchCategoriesSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * CMS-ordered category rail: every category the CMS returns, 4 visible on
 * mobile and `columns_count` (max 8) on desktop, with a real "View all"
 * destination. The rail scrolls horizontally instead of dropping items.
 */
export default async function CatchCategoriesSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchCategoriesSectionProps) {
  if (!endpoint) return null;
  const t = await getTranslations("catchHome");

  let categories: HomeCategory[] = [];
  try {
    categories = normalizeList(
      await homePageService.fetchSectionData<
        HomeCategory[] | { data: HomeCategory[] }
      >(endpoint, locale),
    );
  } catch (error) {
    console.error("[CatchCategoriesSection] Failed to fetch categories:", error);
    return null;
  }

  if (!categories || categories.length === 0) return null;

  const desktopColumns = Math.max(
    4,
    Math.min(8, Math.round(setting?.columns_count ?? 8)),
  );

  const showTitle = setting?.show_title !== false;
  const subtitle = resolveLocalizedText(setting?.subtitle, locale);
  const showViewAll = setting?.show_view_all !== false;
  const actionLabel = resolveLocalizedText(
    setting?.action_label,
    locale,
    t("viewAll"),
  );
  const actionHref = setting?.action_href?.trim() || "/categories";
  const showProductCount = setting?.show_product_count === true;
  const isCircle = setting?.shape === "circle";

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
        className="catch-category-rail"
        style={{ "--cat-cols": desktopColumns } as CSSProperties}
      >
        {categories.map((cat) => {
          const image = cat.image?.desktop || cat.image?.mobile;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex min-w-0 flex-col gap-2 rounded-2xl border border-catch-border-soft bg-white p-1.5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-elev-2 sm:p-2"
            >
              <div
                className={cn(
                  "relative aspect-square w-full overflow-hidden bg-catch-blush",
                  isCircle ? "rounded-full" : "rounded-xl",
                )}
              >
                {image ? (
                  <CampaignImage
                    desktop={cat.image.desktop || cat.image.mobile}
                    mobile={cat.image.mobile}
                    alt={cat.name}
                    width={320}
                    height={320}
                    mobileWidth={320}
                    mobileHeight={320}
                    sizes="(max-width: 1023px) 25vw, 12.5vw"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-lg font-bold text-catch-rose"
                    aria-hidden
                  >
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-catch-charcoal transition-colors group-hover:text-primary sm:text-xs">
                {cat.name}
              </span>
              {showProductCount && typeof cat.products_count === "number" ? (
                <span className="text-center text-[10px] text-catch-muted">
                  {t("productCount", { count: cat.products_count })}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
