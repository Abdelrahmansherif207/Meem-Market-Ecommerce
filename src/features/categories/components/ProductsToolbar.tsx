"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import type { CategoryProductsResponse } from "../types";

interface ProductsToolbarProps {
  links?: CategoryProductsResponse["links"];
  sortOptions?: { value: string; label: string }[];
}

const defaultSortOptions = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Best Rating" },
];

export default function ProductsToolbar({
  links,
  sortOptions = defaultSortOptions,
}: ProductsToolbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "";
  const searchQuery = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(searchQuery);

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
    updateParam("search", searchValue);
  };

  const clearSearch = () => {
    setSearchValue("");
    updateParam("search", "");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search in category..."
          className="w-full h-9 pl-9 pr-8 rounded-md border border-gray-200 text-sm bg-background focus:outline-none focus:border-primary transition-colors"
        />
        {searchValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </form>

      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="h-9 rounded-md border border-gray-200 text-sm bg-background px-3 focus:outline-none focus:border-primary transition-colors"
        aria-label="Sort products"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {links && (
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {links.from}–{links.to} of {links.total}
        </span>
      )}
    </div>
  );
}
