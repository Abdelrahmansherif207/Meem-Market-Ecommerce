"use client";

import { useState, useMemo } from "react";
import BrandCard from "./BrandCard";
import type { Brand } from "../types";

interface BrandListingClientProps {
  brands: Brand[];
  locale: string;
}

type SortMode = "a-z" | "z-a" | "newest";

export default function BrandListingClient({ brands, locale }: BrandListingClientProps) {
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
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-text-secondary">
            {search.trim()
              ? `No brands match "${search}"`
              : "No brands yet"}
          </p>
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Clear search
            </button>
          )}
          {!search.trim() && (
            <a
              href={`/${locale}`}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Browse Products
            </a>
          )}
        </div>
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
