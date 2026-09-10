"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryProductsResponse } from "../types";

interface ProductsToolbarProps {
  links?: CategoryProductsResponse["links"];
  sortOptions?: { value: string; label: string }[];
}

export default function ProductsToolbar({
  links,
  sortOptions,
}: ProductsToolbarProps) {
  const t = useTranslations("header.filters");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "";
  const searchQuery = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(searchQuery);

  // Keep the input in sync when the URL changes externally
  // (e.g. browser back/forward, filter chips).
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const resolvedSortOptions = sortOptions ?? [
    { value: "", label: t("sortDefault") },
    { value: "price_asc", label: t("sortPriceAsc") },
    { value: "price_desc", label: t("sortPriceDesc") },
    { value: "newest", label: t("sortNewest") },
    { value: "rating", label: t("sortRating") },
  ];

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchValue.trim());
  };

  const clearSearch = () => {
    setSearchValue("");
    updateParam("search", "");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className="relative min-w-[200px] flex-1"
      >
        <Search
          className="pointer-events-none absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
        <input
          type="search"
          autoComplete="off"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-border-subtle bg-surface/60 pe-10 ps-10 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/70 hover:border-primary/40 focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/10"
        />
        {searchValue && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label={t("clearSearch")}
            className="absolute inset-e-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-border-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      <label className="relative inline-flex shrink-0 items-center">
        <ArrowUpDown
          className="pointer-events-none absolute inset-s-3.5 size-4 text-text-secondary"
          aria-hidden="true"
        />
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          aria-label={t("sortLabel")}
          className="h-11 cursor-pointer appearance-none rounded-xl border border-border-subtle bg-surface/60 pe-9 ps-10 text-sm font-semibold text-text-primary outline-none transition-all hover:border-primary/40 focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/10"
        >
          {resolvedSortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-e-3 size-4 text-text-secondary"
          aria-hidden="true"
        />
      </label>

      {links && (
        <span className="ms-auto inline-flex items-center whitespace-nowrap rounded-full bg-surface px-3 py-2 text-xs font-medium text-text-secondary tabular-nums">
          {t("resultsCount", {
            from: links.from,
            to: links.to,
            total: links.total,
          })}
        </span>
      )}
    </div>
  );
}
