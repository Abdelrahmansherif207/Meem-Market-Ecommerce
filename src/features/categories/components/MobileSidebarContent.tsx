"use client";

import { use } from "react";
import MobileFilterBar from "./MobileFilterBar";
import type { CategoryFilters } from "../types";

interface MobileSidebarContentProps {
  sidebarPromise: Promise<{
    filters: CategoryFilters;
    filterLabels: Record<string, string>;
  }>;
  seeMoreText: string;
  seeLessText: string;
}

export default function MobileSidebarContent({
  sidebarPromise,
  seeMoreText,
  seeLessText,
}: MobileSidebarContentProps) {
  const { filters, filterLabels } = use(sidebarPromise);

  return (
    <MobileFilterBar
      filters={filters}
      filterLabels={filterLabels}
      seeMoreText={seeMoreText}
      seeLessText={seeLessText}
    />
  );
}
