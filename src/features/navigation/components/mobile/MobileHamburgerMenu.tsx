"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { CategoryMenuItem } from "@/features/categories/types";
import { categoryMenuWithCache } from "@/features/categories/services/categoryMenuCache";

function AccordionGroup({
  items,
  level = 0,
  onNavigate,
}: {
  items: CategoryMenuItem[];
  level?: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className={cn(level > 0 && "ms-3 border-s border-gray-200 ps-3")}>
      {items.map((item) => {
        const hasChildren = item.children?.length > 0;
        const isExpanded = expanded.has(item.id);
        return (
          <li key={item.id}>
            <div className="flex items-center justify-between py-2">
              <Link
                href={`/category/${item.slug}`}
                onClick={onNavigate}
                className="flex-1 text-sm font-medium text-text-primary hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  className="p-1 hover:bg-surface rounded"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>
              )}
            </div>
            {hasChildren && isExpanded && (
              <AccordionGroup items={item.children} level={level + 1} onNavigate={onNavigate} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function MobileHamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!open || categories.length > 0) return;
    setLoading(true);
    categoryMenuWithCache.getMenu(locale)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [open, locale, categories.length]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center p-1"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />
          <div
            ref={drawerRef}
            className={cn(
              "relative h-full w-[300px] max-w-[80vw] bg-background shadow-xl overflow-y-auto",
              "animate-in slide-in-from-left duration-300",
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-lg font-bold">Categories</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="p-1 hover:bg-surface rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-2">
              {loading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 w-3/4 animate-pulse bg-surface rounded" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <AccordionGroup items={categories} onNavigate={close} />
              ) : (
                <Link
                  href="/categories"
                  onClick={close}
                  className="block py-4 text-sm text-primary font-medium"
                >
                  Browse All Categories
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
