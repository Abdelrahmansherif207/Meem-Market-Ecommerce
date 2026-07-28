"use client";

import { Search, ArrowUpRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
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

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    router.push(`/search?q=${encodeURIComponent(name)}`);
    onClose();
  };

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            <span className="text-sm text-text-secondary">
              Searching...
            </span>
          </div>
        )}

        {!isLoading && results.length === 0 && query.length >= 2 && (
          <div className="px-4 py-6 text-center text-sm text-text-secondary">
            No results found
          </div>
        )}

        {results.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSelect(product.name)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
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
