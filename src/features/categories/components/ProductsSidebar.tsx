"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import ExpandableList from "./ExpandableList";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brandSearchQuery, setBrandSearchQuery] = useState("");

  const handleToggleFilter = (filterKey: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(filterKey)?.split(",").filter(Boolean) || [];

    if (currentValues.includes(value)) {
      const nextValues = currentValues.filter((v) => v !== value);
      if (nextValues.length > 0) {
        params.set(filterKey, nextValues.join(","));
      } else {
        params.delete(filterKey);
      }
    } else {
      currentValues.push(value);
      params.set(filterKey, currentValues.join(","));
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const entries = Object.entries(filters).filter(
    ([key, values]) => key !== "category" && values && values.length > 0,
  );

  if (entries.length === 0) return null;

  return (
    <aside className="w-80 shrink-0 border border-border-subtle">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 p-5">
        {entries.map(([key, values]) => {
          const label = filterLabels[key];
          const items = values!;
          const isLong = items.length > 6;

          let itemsToDisplay = items;
          if (key === "brand" && brandSearchQuery) {
            const lowerQuery = brandSearchQuery.toLowerCase();
            itemsToDisplay = items.filter((v: string) =>
              v.toLowerCase().includes(lowerQuery)
            );
          }

          const checkedItems = searchParams.get(key)?.split(",").filter(Boolean) || [];

          return (
            <div key={key} className="py-3">
              <h3 className="font-semibold text-sm mb-3">{label}</h3>
              {key === "brand" && (
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search Brand"
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-[#a7c6f5] bg-transparent py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-[#a7c6f5] focus:border-primary focus:outline-none"
                  />
                </div>
              )}
              {isLong ? (
                <ExpandableList
                  items={itemsToDisplay}
                  seeMoreText={seeMoreText}
                  seeLessText={seeLessText}
                  checkedItems={checkedItems}
                  onToggle={(value) => handleToggleFilter(key, value)}
                />
              ) : (
                itemsToDisplay.map((value: string) => {
                  const isChecked = checkedItems.includes(value);
                  return (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={isChecked}
                        onChange={() => handleToggleFilter(key, value)}
                      />
                      {value}
                    </label>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
