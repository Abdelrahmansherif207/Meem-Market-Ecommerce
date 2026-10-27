"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryMenuItem } from "@/features/categories/types";
import CategoryMenuClient from "@/features/categories/components/CategoryMenuClient";
import SubCategoryPane from "@/features/categories/components/SubCategoryPane";
import { cn } from "@/shared/utils/cn";

type CategoryNavClientProps = {
  allCategoriesLabel: string;
  categories: CategoryMenuItem[];
};

const SCROLL_AMOUNT = 240;
const EDGE_EPSILON = 1;

export default function CategoryNavClient({
  allCategoriesLabel,
  categories,
}: CategoryNavClientProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [hoveredCategory, setHoveredCategory] = useState<CategoryMenuItem | null>(null);
  const [isAllMenuOpen, setIsAllMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Whether content continues beyond the visible left/right edges. RTL-aware:
  // in RTL the content starts at the right edge (scrollLeft = 0) and grows
  // negative toward the end, per the CSSOM scrolling spec.
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxOffset = el.scrollWidth - el.clientWidth;
    if (isRtl) {
      setCanScrollLeft(Math.abs(el.scrollLeft) < maxOffset - EDGE_EPSILON);
      setCanScrollRight(el.scrollLeft < -EDGE_EPSILON);
    } else {
      setCanScrollLeft(el.scrollLeft > EDGE_EPSILON);
      setCanScrollRight(el.scrollLeft < maxOffset - EDGE_EPSILON);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollTo = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (!categories?.length) return null;

  const arrowClasses =
    "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-text-secondary shadow-elev-1 transition-colors hover:bg-surface hover:text-primary";

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
          <div
            ref={scrollRef}
            className="no-scrollbar overflow-x-auto overflow-y-hidden"
          >
            <ul className="flex w-max items-center whitespace-nowrap pe-2 text-base text-primary-dark gap-4 sm:gap-6 md:gap-8">
              {categories.map((item) => (
                <li
                  key={item.id}
                  className="shrink-0"
                  onMouseEnter={() => setHoveredCategory(item)}
                  onFocus={() => setHoveredCategory(item)}
                >
                  <Link
                    href={`/category/${item.slug}`}
                    className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors font-medium leading-5"
                  >
                    {item.image?.desktop && (
                      <Image
                        src={item.image.desktop}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    )}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {canScrollLeft && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-background to-transparent"
              />
              <button
                type="button"
                aria-label={isRtl ? "Next" : "Previous"}
                onClick={() => scrollTo("left")}
                className={cn(arrowClasses, "left-0")}
              >
                <ChevronLeft size={16} />
              </button>
            </>
          )}

          {canScrollRight && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-8 bg-gradient-to-l from-background to-transparent"
              />
              <button
                type="button"
                aria-label={isRtl ? "Previous" : "Next"}
                onClick={() => scrollTo("right")}
                className={cn(arrowClasses, "right-0")}
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {hoveredCategory && (
            <div className="absolute left-0 top-full z-50 pt-2 w-full max-w-6xl">
              <div className="rounded-xl bg-background shadow-lg overflow-hidden">
                <div className={cn("min-h-95 max-h-[70dvh] overflow-y-auto overscroll-contain scrollbar-brand")}>
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
