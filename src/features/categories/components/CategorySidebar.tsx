"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LayoutGrid } from "lucide-react";
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
  const t = useTranslations("header.categoryNav");

  return (
    <aside className="bg-surface border-e border-border overflow-y-auto overscroll-contain scrollbar-brand min-h-0">
      <ul className="py-2">
        <li className="mb-1 border-b border-border pb-1">
          <Link
            href="/categories"
            onClick={onClose}
            className="flex w-full items-center px-4 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-border"
          >
            <span className="me-2 flex h-6 w-6 shrink-0 items-center justify-center">
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </span>
            {t("viewAll")}
          </Link>
        </li>
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
                  "flex w-full items-center px-4 py-2 text-[13px] text-text-primary transition-colors hover:bg-border",
                  isActive && "bg-border font-semibold",
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
