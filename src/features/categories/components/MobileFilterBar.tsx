"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import MobileFiltersModal from "./MobileFiltersModal";
import type { CategoryFilters } from "../types";

interface MobileFilterBarProps {
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
  seeMoreText: string;
  seeLessText: string;
}

export default function MobileFilterBar({
  filters,
  filterLabels,
  seeMoreText,
  seeLessText,
}: MobileFilterBarProps) {
  const t = useTranslations("header.filters");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = Object.entries(filters).some(
    ([key, values]) => key !== "category" && values && values.length > 0,
  );

  if (!hasFilters) return null;

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <button
          id="mobile-filters-btn"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
        >
          <Image
            src="/icons/funnel.svg"
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            aria-hidden="true"
          />
          {t("filters")}
        </button>
      </div>

      {/* Modal */}
      <MobileFiltersModal
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        filterLabels={filterLabels}
        seeMoreText={seeMoreText}
        seeLessText={seeLessText}
      />
    </>
  );
}
