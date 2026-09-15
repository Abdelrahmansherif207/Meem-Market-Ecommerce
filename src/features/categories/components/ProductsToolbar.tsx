"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductsToolbarProps {
  sortOptions?: { value: string; label: string }[];
}

export default function ProductsToolbar({
  sortOptions,
}: ProductsToolbarProps) {
  const t = useTranslations("header.filters");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "";

  const resolvedSortOptions = sortOptions ?? [
    { value: "", label: t("sortDefault") },
    { value: "price_asc", label: t("sortPriceAsc") },
    { value: "price_desc", label: t("sortPriceDesc") },
  ];

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      // Sort restarts the cursor list.
      params.delete("page");
      params.delete("cursor");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router],
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
      <label className="relative inline-flex shrink-0 items-center">
        <ArrowUpDown
          className="pointer-events-none absolute inset-s-3.5 size-4 text-text-secondary"
          aria-hidden="true"
        />
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
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
    </div>
  );
}
