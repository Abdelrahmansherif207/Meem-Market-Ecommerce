import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { homePageService } from "../services/homePageService";
import { normalizeList } from "./normalize";
import type { SectionFrontSetting, HomeCategory } from "../types";

interface CatchCategoriesSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched category section. `layout: "list"` renders horizontal
 * cards (parent categories); otherwise centered circular tiles in a grid.
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
      await homePageService.fetchSectionData<HomeCategory[] | { data: HomeCategory[] }>(endpoint, locale),
    );
  } catch (error) {
    console.error("[CatchCategoriesSection] Failed to fetch categories:", error);
    return null;
  }

  if (!categories || categories.length === 0) return null;

  const header = title ? (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
      <a
        href="#"
        className="text-xs font-semibold text-neutral-700 underline underline-offset-4 transition-colors hover:text-black"
      >
        {t("viewAll")}
      </a>
    </div>
  ) : null;

  if (setting?.layout === "list") {
    return (
      <section className="space-y-4">
        {header}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {cat.image?.desktop && (
                  <Image
                    src={cat.image.desktop}
                    alt={cat.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border border-neutral-100 object-cover"
                  />
                )}
                <span className="text-sm font-semibold text-neutral-900 transition-colors group-hover:text-primary">
                  {cat.name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {header}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/${locale}/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white p-3 text-center transition-shadow hover:shadow-md"
          >
            {cat.image?.desktop && (
              <Image
                src={cat.image.desktop}
                alt={cat.name}
                width={72}
                height={72}
                className="h-16 w-16 rounded-full border border-neutral-100 object-cover transition-transform group-hover:scale-105"
              />
            )}
            <span className="line-clamp-2 text-xs font-semibold text-neutral-800 transition-colors group-hover:text-primary">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
