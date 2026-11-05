"use client";

import { useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { SearchAutocompleteDropdown } from "../header/SearchAutocompleteDropdown";
import { useSearchAutocomplete } from "../../hooks/useSearchAutocomplete";

interface CatchSearchBarProps {
  placeholder: string;
}

/**
 * Screen-styled search pill (`rounded-full bg-[#F5F5F7]` with a start-aligned
 * icon). Reuses the existing autocomplete hook + dropdown so search behavior,
 * API calls and routing stay untouched.
 */
export default function CatchSearchBar({ placeholder }: CatchSearchBarProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    open,
    close,
  } = useSearchAutocomplete();

  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      close();
    }, 200);
  }, [close]);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (results.length > 0) {
      open();
    }
  }, [results, open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        close();
      }
    },
    [query, router, close],
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="pointer-events-none absolute start-4 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="h-[38px] w-full rounded-full border-0 bg-[#f5f5f7] ps-11 pe-4 text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
        />
      </form>
      <SearchAutocompleteDropdown
        results={results}
        isLoading={isLoading}
        isOpen={isOpen}
        query={query}
        onClose={close}
      />
    </div>
  );
}
