import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CampaignImage } from "@/components/ui/CampaignImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/shared/utils/cn";
import { homePageService } from "../services/homePageService";
import { resolveLocalizedText } from "../utils";
import { normalizeList } from "./normalize";
import {
  parseBooleanSetting,
  parseIntegerSetting,
  resolveCategoryGridConfig,
} from "./categoryGrid";
import type { SectionFrontSetting, HomeCategory } from "../types";

interface CatchCategoriesSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * CMS-ordered category section.
 *
 * Grid is the default: all categories the CMS returns are rendered, with
 * desktop/tablet/mobile column counts driven by `setting.front`. The old
 * horizontal rail remains available with `layout: "slider"`.
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

  const config = resolveCategoryGridConfig(categories.length, setting);
  const showTitle = parseBooleanSetting(setting?.show_title, true);
  const subtitle = resolveLocalizedText(setting?.subtitle, locale);
  const showViewAll = parseBooleanSetting(setting?.show_view_all, true);
  const actionLabel = resolveLocalizedText(
    setting?.action_label,
    locale,
    t("viewAll"),
  );
  const actionHref =
    typeof setting?.action_href === "string" && setting.action_href.trim()
      ? setting.action_href.trim()
      : "/categories";
  const showProductCount = parseBooleanSetting(
    setting?.show_product_count,
    false,
  );
  const isCircle = config.shape === "circle";

  // Slider keeps the old one-row rail; column count still comes from the CMS.
  const sliderColumns = parseIntegerSetting(setting?.columns_count, 8);
  const sliderImageSizes = `(max-width: 1023px) 25vw, ${Math.ceil(
    100 / sliderColumns,
  )}vw`;
  const gridImageSizes = `(max-width: 767px) ${Math.ceil(
    100 / config.mobile.columns,
  )}vw, (max-width: 1023px) ${Math.ceil(
    100 / config.tablet.columns,
  )}vw, ${Math.ceil(100 / config.desktop.columns)}vw`;

  return (
    <section className="w-full space-y-4">
      {showTitle ? (
        <SectionHeader
          title={title}
          subtitle={subtitle}
          subtitleClassName={subtitle ? "hidden md:block" : undefined}
          actionLabel={showViewAll ? actionLabel : undefined}
          actionHref={showViewAll ? actionHref : undefined}
        />
      ) : null}

      {config.layout === "slider" ? (
        <div
          className="catch-category-rail"
          style={{ "--cat-cols": sliderColumns } as CSSProperties}
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
                      sizes={sliderImageSizes}
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
                {showProductCount &&
                typeof cat.products_count === "number" ? (
                  <span className="text-center text-[10px] text-catch-muted">
                    {t("productCount", { count: cat.products_count })}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          className="catch-category-grid"
          data-cat-tile-mobile={config.mobile.tileMode}
          data-cat-tile-tablet={config.tablet.tileMode}
          data-cat-tile-desktop={config.desktop.tileMode}
          style={
            {
              "--cat-cols-mobile": config.mobile.columns,
              "--cat-cols-tablet": config.tablet.columns,
              "--cat-cols-desktop": config.desktop.columns,
            } as CSSProperties
          }
        >
          {categories.map((cat) => (
            <CategoryGridTile
              key={cat.id}
              category={cat}
              sizes={gridImageSizes}
              productCount={
                showProductCount && typeof cat.products_count === "number"
                  ? t("productCount", { count: cat.products_count })
                  : null
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryGridTile({
  category,
  sizes,
  productCount,
}: {
  category: HomeCategory;
  sizes: string;
  productCount: string | null;
}) {
  const image = category.image?.desktop || category.image?.mobile;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="catch-category-tile group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-catch-rose focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span className="catch-category-tile__image">
        {image ? (
          <CampaignImage
            desktop={category.image.desktop || category.image.mobile}
            mobile={category.image.mobile}
            alt={category.name}
            width={320}
            height={320}
            mobileWidth={320}
            mobileHeight={320}
            sizes={sizes}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-lg font-bold text-catch-rose"
            aria-hidden
          >
            {category.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="catch-category-tile__name line-clamp-2">
        {category.name}
      </span>
      {productCount ? (
        <span className="catch-category-tile__count">{productCount}</span>
      ) : null}
    </Link>
  );
}
