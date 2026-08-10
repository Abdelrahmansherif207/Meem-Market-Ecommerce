"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ExpandableList from "./ExpandableList";
import FilterCheckbox from "./FilterCheckbox";
import type { CategoryFilters } from "../types";

interface ProductsSidebarProps {
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
  seeMoreText: string;
  seeLessText: string;
}

export default function ProductsSidebar({
  filters,
  filterLabels,
  seeMoreText,
  seeLessText,
}: ProductsSidebarProps) {
  const t = useTranslations("header.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const entries = Object.entries(filters).filter(
    (entry): entry is [string, string[]] =>
      entry[0] !== "category" &&
      Array.isArray(entry[1]) &&
      entry[1].length > 0,
  );

  const navigateWithParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleToggleFilter = (filterKey: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(filterKey)?.split(",").filter(Boolean) || [];

    if (currentValues.includes(value)) {
      const nextValues = currentValues.filter((item) => item !== value);
      if (nextValues.length > 0) {
        params.set(filterKey, nextValues.join(","));
      } else {
        params.delete(filterKey);
      }
    } else {
      params.set(filterKey, [...currentValues, value].join(","));
    }

    params.delete("page");
    navigateWithParams(params);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    entries.forEach(([key]) => params.delete(key));
    params.delete("page");
    navigateWithParams(params);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const activeFilterCount = entries.reduce((count, [key]) => {
    return count + (searchParams.get(key)?.split(",").filter(Boolean).length || 0);
  }, 0);

  if (entries.length === 0) return null;

  return (
    <aside
      aria-label={t("filtersTitle")}
      className="card-shadow flex max-h-[calc(100dvh-11rem)] w-80 shrink-0 self-start flex-col overflow-hidden rounded-2xl border border-border-subtle bg-background"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-linear-to-b from-primary/[0.07] to-background px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <SlidersHorizontal className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-bold text-text-primary">
              {t("filtersTitle")}
            </h2>
            <p className="mt-0.5 truncate text-xs text-text-secondary">
              {activeFilterCount > 0
                ? t("activeFilters", { count: activeFilterCount })
                : t("refineResults")}
            </p>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("clearAll")}
          </button>
        )}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {entries.map(([key, values]) => {
          const label = filterLabels[key] || key;
          const items = values!;
          const checkedItems =
            searchParams.get(key)?.split(",").filter(Boolean) || [];
          const isOpen = !collapsedSections.includes(key);
          const sectionId = `filter-section-${key}`;

          let itemsToDisplay = items;
          if (key === "brand" && brandSearchQuery) {
            const normalizedQuery = brandSearchQuery.trim().toLocaleLowerCase();
            itemsToDisplay = items.filter((value) =>
              value.toLocaleLowerCase().includes(normalizedQuery),
            );
          }

          return (
            <section
              key={key}
              className="border-b border-border-subtle last:border-b-0"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  aria-expanded={isOpen}
                  aria-controls={sectionId}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start transition-colors hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/25"
                >
                  <span className="text-sm font-bold text-text-primary">
                    {label}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {checkedItems.length > 0 && (
                      <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-4 text-white">
                        {checkedItems.length}
                      </span>
                    )}
                    <ChevronDown
                      className={`size-4 text-text-secondary transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </h3>

              {isOpen && (
                <div id={sectionId} className="px-4 pb-5">
                  {key === "brand" && (
                    <div className="relative mb-3">
                      <Search
                        className="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-text-secondary"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        autoComplete="off"
                        aria-label={t("searchBrand")}
                        placeholder={t("searchBrand")}
                        value={brandSearchQuery}
                        onChange={(event) =>
                          setBrandSearchQuery(event.target.value)
                        }
                        className="h-10 w-full rounded-xl border border-border-subtle bg-surface/60 ps-10 pe-10 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/70 hover:border-primary/40 focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/10"
                      />
                      {brandSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBrandSearchQuery("")}
                          aria-label={t("clearBrandSearch")}
                          className="absolute inset-e-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-border-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}

                  {itemsToDisplay.length === 0 ? (
                    <p className="rounded-xl bg-surface px-3 py-4 text-center text-xs text-text-secondary">
                      {t("noBrandsFound")}
                    </p>
                  ) : itemsToDisplay.length > 6 ? (
                    <ExpandableList
                      items={itemsToDisplay}
                      seeMoreText={seeMoreText}
                      seeLessText={seeLessText}
                      checkedItems={checkedItems}
                      onToggle={(value) => handleToggleFilter(key, value)}
                    />
                  ) : (
                    <div className="space-y-0.5">
                      {itemsToDisplay.map((value) => (
                        <FilterCheckbox
                          key={value}
                          value={value}
                          checked={checkedItems.includes(value)}
                          onChange={() => handleToggleFilter(key, value)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
