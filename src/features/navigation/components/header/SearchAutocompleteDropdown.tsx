"use client";

import { Search, ArrowUpRight, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { ProductSearchResult } from "@/features/products/types";


function highlightMatch(name: string, query: string) {
  if (!query) return name;
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <span className="font-bold">{name.slice(idx, idx + query.length)}</span>
      {name.slice(idx + query.length)}
    </>
  );
}

interface SearchAutocompleteDropdownProps {
  results: ProductSearchResult[];
  isLoading: boolean;
  isOpen: boolean;
  query: string;
  onClose: () => void;
}

export function SearchAutocompleteDropdown({
  results,
  isLoading,
  isOpen,
  query,
  onClose,
}: SearchAutocompleteDropdownProps) {
  const router = useRouter();
  const t = useTranslations("header.search");

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    router.push(`/search?q=${encodeURIComponent(name)}`);
    onClose();
  };

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-white shadow-lg">
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className={cn(
            "flex flex-col items-center justify-center gap-3 py-8 px-4",
            results.length > 0 && "border-b border-border-subtle py-4"
          )}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-medium text-text-secondary">
              {t("searching")}
            </span>
          </div>
        )}

        {!isLoading && results.length === 0 && query.length >= 2 && (
          <div className="px-4 py-6 text-center text-sm text-text-secondary">
            {t("noResults")}
          </div>
        )}

        {results.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSelect(product.name)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface"
          >
            <Search className="h-4 w-4 shrink-0 text-text-muted" />
            <span className="flex-1 truncate text-sm text-text-primary">
              {highlightMatch(product.name, query)}
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
