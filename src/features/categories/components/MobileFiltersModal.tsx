"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryFilters } from "../types";
import ExpandableList from "./ExpandableList";

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

  // Local draft state — only applied when user taps "Show"
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync draft from URL params whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, string[]> = {};
    Object.keys(filters).forEach((key) => {
      const val = searchParams.get(key);
      initial[key] = val ? val.split(",").filter(Boolean) : [];
    });
    setDraft(initial);
    setBrandSearchQuery("");
    // Scroll to top on open
    scrollRef.current?.scrollTo({ top: 0 });
  }, [isOpen, filters, searchParams]);

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
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("searchBrand")}
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {isLong ? (
                  <ExpandableList
                    items={itemsToDisplay}
                    seeMoreText={seeMoreText}
                    seeLessText={seeLessText}
                    checkedItems={checkedItems}
                    onToggle={(value) => handleToggle(key, value)}
                  />
                ) : (
                  itemsToDisplay.map((value: string) => {
                    const isChecked = checkedItems.includes(value);
                    return (
                      <label
                        key={value}
                        className="flex items-center justify-between text-sm cursor-pointer py-2.5 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-800">{value}</span>
                        <input
                          type="checkbox"
                          className="accent-primary w-4 h-4"
                          checked={isChecked}
                          onChange={() => handleToggle(key, value)}
                        />
                      </label>
                    );
                  })
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
