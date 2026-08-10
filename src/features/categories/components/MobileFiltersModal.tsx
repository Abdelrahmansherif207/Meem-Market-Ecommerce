"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryFilters } from "../types";
import ExpandableList from "./ExpandableList";
import FilterCheckbox from "./FilterCheckbox";

interface MobileFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CategoryFilters;
  filterLabels: Record<string, string>;
  seeMoreText: string;
  seeLessText: string;
}

export default function MobileFiltersModal({
  isOpen,
  onClose,
  filters,
  filterLabels,
  seeMoreText,
  seeLessText,
}: MobileFiltersModalProps) {
  const t = useTranslations("header.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brandSearchQuery, setBrandSearchQuery] = useState("");

  // The modal mounts on open, so the local draft always starts from the URL.
  const [draft, setDraft] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    Object.keys(filters).forEach((key) => {
      const value = searchParams.get(key);
      initial[key] = value ? value.split(",").filter(Boolean) : [];
    });
    return initial;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggle = (key: string, value: string) => {
    setDraft((prev) => {
      const current = prev[key] ?? [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const handleClearAll = () => {
    const cleared: Record<string, string[]> = {};
    Object.keys(filters).forEach((key) => (cleared[key] = []));
    setDraft(cleared);
  };

  const handleShow = () => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(draft).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onClose();
  };

  const entries = Object.entries(filters).filter(
    ([key, values]) => key !== "category" && values && values.length > 0,
  );

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t("filtersTitle")}
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative z-10 w-full bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <span className="text-base font-semibold text-gray-900">
            {t("filtersTitle")}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label={t("close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 px-5 py-2">
          {entries.map(([key, values]) => {
            const label = filterLabels[key];
            const items = values!;
            const isLong = items.length > 6;

            let itemsToDisplay = items;
            if (key === "brand" && brandSearchQuery) {
              const lowerQuery = brandSearchQuery.toLowerCase();
              itemsToDisplay = items.filter((v: string) =>
                v.toLowerCase().includes(lowerQuery),
              );
            }

            const checkedItems = draft[key] ?? [];

            return (
              <div key={key} className="py-3 border-b border-gray-100 last:border-b-0">
                <h3 className="font-semibold text-sm mb-3 text-gray-900">{label}</h3>

                {key === "brand" && (
                  <div className="relative mb-3">
                    <Search
                      className="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-text-secondary"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      autoComplete="off"
                      aria-label={t("searchBrand")}
                      placeholder={t("searchBrand")}
                      value={brandSearchQuery}
                      onChange={(event) =>
                        setBrandSearchQuery(event.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-border-subtle bg-surface/60 ps-10 pe-10 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/70 focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/10"
                    />
                    {brandSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBrandSearchQuery("")}
                        aria-label={t("clearBrandSearch")}
                        className="absolute inset-e-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-border-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {itemsToDisplay.length === 0 ? (
                  <p className="rounded-xl bg-surface px-3 py-4 text-center text-xs text-text-secondary">
                    {t("noBrandsFound")}
                  </p>
                ) : isLong ? (
                  <ExpandableList
                    items={itemsToDisplay}
                    seeMoreText={seeMoreText}
                    seeLessText={seeLessText}
                    checkedItems={checkedItems}
                    onToggle={(value) => handleToggle(key, value)}
                  />
                ) : (
                  <div className="space-y-0.5">
                    {itemsToDisplay.map((value: string) => (
                      <FilterCheckbox
                        key={value}
                        value={value}
                        checked={checkedItems.includes(value)}
                        onChange={() => handleToggle(key, value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={handleClearAll}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("clearAll")}
          </button>
          <button
            onClick={handleShow}
            className="flex-1 py-3 rounded-xl bg-primary text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {t("show")}
          </button>
        </div>
      </div>
    </div>
  );
}
