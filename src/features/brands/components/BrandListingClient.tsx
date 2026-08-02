"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, X } from "lucide-react";
import BrandCard from "./BrandCard";
import EmptyState from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import type { Brand } from "../types";

interface BrandListingClientProps {
  brands: Brand[];
  locale: string;
}

type SortMode = "a-z" | "z-a" | "newest";

export default function BrandListingClient({ brands, locale }: BrandListingClientProps) {
  const t = useTranslations("emptyState");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("a-z");

  const filtered = useMemo(() => {
    let result = brands;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "a-z":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        result = [...result].sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [brands, search, sort]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full sm:max-w-xs rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="a-z">A–Z</option>
          <option value="z-a">Z–A</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="notFound"
          title={
            search.trim()
              ? t("noBrandsMatch", { search })
              : t("noBrands")
          }
          actions={
            search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <X className="size-4" />
                {t("clearSearch")}
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
              >
                <ShoppingBag className="size-4" />
                {t("browseProducts")}
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((brand, i) => (
            <BrandCard key={brand.id} brand={brand} priority={i < 6} />
          ))}
        </div>
      )}
    </div>
  );
}
