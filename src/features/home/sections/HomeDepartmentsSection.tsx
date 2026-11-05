import Image from "next/image";
import { Sparkles, Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { cn } from "@/shared/utils/cn";
import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";

import HomeSectionHeader from "./HomeSectionHeader";
import { normalizeList } from "./mappers";
import { homePageService } from "../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import type { HomeCategory, SectionFrontSetting } from "../types";

interface ChipCategory {
  id: number;
  name: string;
  slug: string;
  image: { desktop: string; mobile: string };
  products_count?: number;
}

interface HomeDepartmentsSectionProps {
  type: string;
  title: string;
  locale: string;
  endpoint?: string;
  setting?: SectionFrontSetting;
}

/**
 * "Shop by Department" matched to the approved reference shot: rounded
 * square image tiles (~80px, hairline border → rose border on hover) with
 * muted labels below, a decorative dotted film-strip pinned to the start
 * edge, the serif headline with a crimson "VIEW ALL →", and the two accent
 * tiles — black "New In" (gold sparkles) and deep-rose "Best Deals"
 * (flame, only when the backend has a live flash sale).
 */
export default async function HomeDepartmentsSection({
  type,
  title,
  locale,
  endpoint,
  setting,
}: HomeDepartmentsSectionProps) {
  let categories: ChipCategory[] = [];

  if (type === "featured_categories") {
    try {
      // Same contract as the shared FeaturedCategories section.
      if (endpoint) {
        categories = normalizeList<ChipCategory>(
          await homePageService.fetchSectionData<unknown>(endpoint, locale),
        );
      } else {
        const response = await apiFetch<ApiResponse<ChipCategory[]>>(
          "/featured-categories",
          {
            headers: { lang: locale },
            next: { revalidate: CACHE_TTL.FEATURED },
          },
        );
        categories = response.data;
      }
    } catch {
      return null;
    }
  } else {
    if (!endpoint) return null;
    try {
      categories = normalizeList<HomeCategory>(
        await homePageService.fetchSectionData<unknown>(endpoint, locale),
      );
    } catch (error) {
      console.error(
        "[HomeDepartmentsSection] Failed to fetch categories:",
        error,
      );
      return null;
    }
  }

  const valid = (categories ?? []).filter(
    (c) => c.image?.desktop || c.image?.mobile,
  );
  if (!valid.length) return null;

  const t = await getTranslations({ locale, namespace: "home" });
  const isGrid = setting?.layout === "grid";
  // CMS `shape`: "square" tiles (reference) or "circle" legacy chips.
  const isSquare = setting?.shape !== "circle";

  // Stitch puts a "Best Deals" accent at the end of the row; it points
  // to a real active flash sale when the backend provides one.
  let activeSaleSlug: string | null = null;
  try {
    const sales = await flashSaleService.getFlashSales(locale);
    const active = sales.find(
      (s) => s.slug && new Date(s.end_date) > new Date(),
    );
    activeSaleSlug = active?.slug ?? null;
  } catch {
    // Accent tile is optional — silently omit on failure.
  }

  return (
    <section className="home-container relative">
      {/* Decorative dotted film-strip (start edge, reference shot) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-[-26px] hidden w-6 xl:block"
      >
        <span
          className="absolute inset-y-1 start-[18px] w-[2px] rounded-full"
          style={{ background: "#8b8ef2" }}
        />
        <span
          className="absolute inset-y-2 start-0 end-1"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d9d5cf 1px, transparent 1.2px)",
            backgroundSize: "7px 7px",
            backgroundPosition: "2px 0",
          }}
        />
      </div>

      <HomeSectionHeader
        title={title}
        action={
          <Link
            href="/categories"
            className="text-[11px] font-bold uppercase tracking-wider text-(--home-vermilion) transition-colors hover:text-(--home-rose-deep)"
          >
            {t("viewAll")} →
          </Link>
        }
      />

      {isGrid ? (
        <div className="grid grid-cols-3 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
          {valid.map((category) => (
            <DepartmentChip key={category.id} category={category} square={isSquare} />
          ))}
          <AccentTile href="/categories" label={t("departments.newIn")} kind="new" />
          {activeSaleSlug && (
            <AccentTile
              href={`/flash-sales/${activeSaleSlug}`}
              label={t("departments.bestDeals")}
              kind="deals"
            />
          )}
        </div>
      ) : (
        <div className="no-scrollbar flex scroll-smooth items-start gap-x-2.5 overflow-x-auto pb-1 pt-1 sm:gap-x-3">
          {valid.map((category) => (
            <DepartmentChip key={category.id} category={category} square={isSquare} />
          ))}

          {/* New In accent tile (black + gold sparkles) */}
          <AccentTile href="/categories" label={t("departments.newIn")} kind="new" />

          {/* Best Deals accent tile — only when a real active sale exists */}
          {activeSaleSlug && (
            <AccentTile
              href={`/flash-sales/${activeSaleSlug}`}
              label={t("departments.bestDeals")}
              kind="deals"
            />
          )}
        </div>
      )}
    </section>
  );
}

/* ── Square image tile (reference: hairline border → rose on hover) ──── */

function DepartmentChip({
  category,
  square,
}: {
  category: ChipCategory;
  square?: boolean;
}) {
  const src = category.image.desktop || category.image.mobile;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex w-[84px] shrink-0 flex-col items-center gap-2"
    >
      {square ? (
        <div className="h-20 w-20 overflow-hidden rounded-xl border border-(--home-stroke) bg-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-(--home-rose) group-hover:shadow-[0_8px_20px_-6px_rgba(216,139,151,0.35)]">
          <Image
            src={src}
            alt={category.name}
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="home-ring size-20 transition-transform duration-300 group-hover:scale-105">
          <span className="block size-full overflow-hidden rounded-full bg-white">
            <Image
              src={src}
              alt={category.name}
              width={80}
              height={80}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </span>
        </div>
      )}
      <span className="w-full truncate text-center text-[11px] font-medium text-(--home-ink-muted) transition-colors group-hover:text-(--home-ink)">
        {category.name}
      </span>
    </Link>
  );
}

/* ── Accent tiles: black "New In" / deep-rose "Best Deals" ───────────── */

function AccentTile({
  href,
  label,
  kind,
}: {
  href: string;
  label: string;
  kind: "new" | "deals";
}) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 flex-col items-center gap-2"
    >
      <span
        className={cn(
          "flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl transition-all duration-200",
          "group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_-6px_rgba(18,18,20,0.35)]",
          kind === "new" ? "bg-[#17171a]" : "bg-[#8c4b56]",
        )}
      >
        {kind === "new" ? (
          <Sparkles className="size-8 text-[#e0c298]" aria-hidden />
        ) : (
          <Flame className="size-8 text-white" aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "w-full truncate text-center text-[11px] font-semibold transition-colors",
          kind === "deals"
            ? "text-(--home-rose-deep) group-hover:text-(--home-vermilion)"
            : "text-(--home-ink-muted) group-hover:text-(--home-ink)",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
