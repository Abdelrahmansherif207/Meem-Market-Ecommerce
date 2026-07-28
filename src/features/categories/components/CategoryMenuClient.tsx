"use client";

import { useState } from "react";
import type { CategoryMenuItem } from "../types";
import CategorySidebar from "./CategorySidebar";
import SubCategoryPane from "./SubCategoryPane";

type CategoryMenuClientProps = {
  categories: CategoryMenuItem[];
  onClose?: () => void;
};

export default function CategoryMenuClient({
  categories,
  onClose,
}: CategoryMenuClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const activeCategory =
    categories.find((cat) => cat.id === activeCategoryId) ?? categories[0];

  if (!categories?.length) return null;

  return (
    <div
      aria-label="Category menu"
      className="absolute inset-s-0 top-full z-50 pt-2"
    >
      <div className="w-[calc(100vw-2rem)] max-w-6xl overflow-hidden rounded-xl bg-background shadow-lg">
        <div className="grid grid-cols-[240px_1fr] min-h-95 max-h-[70dvh]">
          <CategorySidebar
            categories={categories}
            activeCategoryId={activeCategory.id}
            onActiveCategoryChange={setActiveCategoryId}
            onClose={onClose}
          />
          <SubCategoryPane activeCategory={activeCategory} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
