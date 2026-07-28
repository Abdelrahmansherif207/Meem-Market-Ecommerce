"use client";

import { use } from "react";
import ProductsSidebar from "./ProductsSidebar";
import type { CategoryFilters } from "../types";

interface SidebarContentProps {
  sidebarPromise: Promise<{
    filters: CategoryFilters;
    filterLabels: Record<string, string>;
  }>;
  seeMoreText: string;
  seeLessText: string;
}

export default function SidebarContent({
  sidebarPromise,
  seeMoreText,
  seeLessText,
}: SidebarContentProps) {
  const { filters, filterLabels } = use(sidebarPromise);

  return (
    <ProductsSidebar
      filters={filters}
      filterLabels={filterLabels}
      seeMoreText={seeMoreText}
      seeLessText={seeLessText}
    />
  );
}
