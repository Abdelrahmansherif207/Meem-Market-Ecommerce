"use client";

import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { Link } from "@/i18n/navigation";
import type { CategoryMenuItem } from "@/features/categories/types";
import CatchCategoriesPanel from "./CatchCategoriesPanel";

interface CatchCategoryNavClientProps {
  allCategoriesLabel: string;
  categories: CategoryMenuItem[];
}

/**
 * Screen secondary nav: "Categories" trigger + category links. Hovering
 * a link (or the trigger) opens the full-width mega panel with that
 * category's subcategories and shows a primary-color underline under the
 * hovered item; leaving the nav row closes both.
 */
export default function CatchCategoryNavClient({
  allCategoriesLabel,
  categories,
}: CatchCategoryNavClientProps) {
  const t = useTranslations("catchHeader");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active = categories.find((c) => c.slug === activeSlug) ?? null;

  return (
    <nav
      aria-label="Categories"
      className="relative border-t border-neutral-100 bg-white"
      onMouseLeave={() => setActiveSlug(null)}
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-8 overflow-x-auto px-4 py-2.5 text-xs font-semibold text-neutral-800 no-scrollbar lg:px-8">
        {/* Categories trigger — opens the panel for the first category */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={!!active}
          onMouseEnter={() => setActiveSlug(categories[0]?.slug ?? null)}
          onFocus={() => setActiveSlug(categories[0]?.slug ?? null)}
          className="relative flex shrink-0 cursor-pointer items-center gap-2 py-2.5 -my-2.5 transition-colors hover:text-primary"
        >
          <Menu className="h-4 w-4 text-black" />
          <span>{allCategoriesLabel}</span>
          <ChevronDown
            className={cn("h-3 w-3 text-neutral-400 transition-transform", !!active && "rotate-180")}
          />
          {active && <span className="absolute inset-x-0 -bottom-2.5 h-0.5 bg-primary" />}
        </button>

        {/* Category links */}
        {categories.map((cat) => {
          const isActive = active?.slug === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              onMouseEnter={() => setActiveSlug(cat.slug)}
              onFocus={() => setActiveSlug(cat.slug)}
              className={cn(
                "relative shrink-0 whitespace-nowrap py-2.5 -my-2.5 transition-colors",
                isActive ? "text-primary" : "hover:text-primary",
              )}
            >
              {cat.name}
              {isActive && <span className="absolute inset-x-0 -bottom-2.5 h-0.5 bg-primary" />}
            </Link>
          );
        })}
      </div>

      {/* Mega panel for the hovered category */}
      {active && (
        <CatchCategoriesPanel
          variant="desktop"
          category={active}
          onClose={() => setActiveSlug(null)}
        />
      )}
    </nav>
  );
}
