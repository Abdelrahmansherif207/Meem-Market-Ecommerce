"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import type { CategoryMenuItem } from "../types";

type CategorySidebarProps = {
  categories: CategoryMenuItem[];
  activeCategoryId: number | null;
  onActiveCategoryChange: (categoryId: number) => void;
  onClose?: () => void;
};

function toCategoryHref(slug: string) {
  return `/category/${encodeURIComponent(slug)}`;
}

export default function CategorySidebar({
  categories,
  activeCategoryId,
  onActiveCategoryChange,
  onClose,
}: CategorySidebarProps) {
  return (
    <aside className="bg-surface border-e border-gray-200 overflow-y-auto">
      <ul className="py-2">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <li key={category.id}>
              <Link
                href={toCategoryHref(category.slug)}
                onClick={onClose}
                onMouseEnter={() => onActiveCategoryChange(category.id)}
                onFocus={() => onActiveCategoryChange(category.id)}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-[13px] text-text-primary transition-colors hover:bg-gray-200",
                  isActive && "bg-gray-200 font-semibold",
                )}
              >
                <>
                      {category.image?.desktop && (
                        <Image
                          src={category.image.desktop}
                          alt=""
                          width={24}
                          height={24}
                          className="mr-2 h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      {category.name}
                    </>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
