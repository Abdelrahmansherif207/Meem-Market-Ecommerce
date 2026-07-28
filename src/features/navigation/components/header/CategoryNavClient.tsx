"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryMenuItem } from "@/features/categories/types";
import CategoryMenuClient from "@/features/categories/components/CategoryMenuClient";
import SubCategoryPane from "@/features/categories/components/SubCategoryPane";
import { cn } from "@/shared/utils/cn";

type CategoryNavClientProps = {
  allCategoriesLabel: string;
  categories: CategoryMenuItem[];
};

export default function CategoryNavClient({
  allCategoriesLabel,
  categories,
}: CategoryNavClientProps) {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryMenuItem | null>(null);
  const [isAllMenuOpen, setIsAllMenuOpen] = useState(false);

  if (!categories?.length) return null;

  return (
    <nav aria-label="Categories" className="w-full">
      <div className="flex h-11 items-center gap-3 rounded-md">
        <div
          className="relative shrink-0 h-full"
          onMouseEnter={() => setIsAllMenuOpen(true)}
          onMouseLeave={() => setIsAllMenuOpen(false)}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isAllMenuOpen}
            className="inline-flex h-full items-center gap-2 rounded-md px-2 py-1 text-[13px] font-semibold text-primary-dark"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center">
              <Image
                src="/icons/grid.svg"
                width={20}
                height={20}
                alt="grid icon"
              />
            </span>
            <span className="whitespace-nowrap">{allCategoriesLabel}</span>
          </button>

          {isAllMenuOpen && (
            <CategoryMenuClient
              categories={categories}
              onClose={() => setIsAllMenuOpen(false)}
            />
          )}
        </div>

        <div
          className="relative flex-1 min-w-0"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="no-scrollbar overflow-x-auto overflow-y-hidden">
            <ul className="flex w-max items-center whitespace-nowrap pe-2 text-sm text-primary-dark gap-4 sm:gap-6 md:gap-8">
              {categories.map((item) => (
                <li
                  key={item.id}
                  className="shrink-0"
                  onMouseEnter={() => setHoveredCategory(item)}
                  onFocus={() => setHoveredCategory(item)}
                >
                  <Link
                    href={`/category/${item.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors font-bold leading-4"
                  >
                    {item.image?.desktop && (
                      <Image
                        src={item.image.desktop}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {hoveredCategory && (
            <div className="absolute left-0 top-full z-50 pt-2 w-full max-w-6xl">
              <div className="rounded-xl bg-background shadow-lg overflow-hidden">
                <div className={cn("min-h-95 max-h-[70dvh]")}>
                  <SubCategoryPane activeCategory={hoveredCategory} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
