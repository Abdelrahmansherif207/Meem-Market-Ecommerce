"use client";

import { useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { SearchAutocompleteDropdown } from "../header/SearchAutocompleteDropdown";
import { useSearchAutocomplete } from "../../hooks/useSearchAutocomplete";

interface CatchMobileSearchBarProps {
  placeholder: string;
  /** Optional leading slot (mobile logo lockup) rendered beside the field. */
  leading?: ReactNode;
}

/**
 * Mobile search bar: warm blush field with a leading icon. Reuses the
 * existing autocomplete hook + dropdown — search behavior, API calls and
 * routing stay untouched. An optional `leading` slot lets the compact logo
 * sit in the same row without shrinking the dropdown.
 */
export default function CatchMobileSearchBar({
  placeholder,
  leading,
}: CatchMobileSearchBarProps) {
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
    <div className="relative px-3 pb-2 pt-2.5">
      <div className="flex items-center gap-3">
        {leading}
        <form
          onSubmit={handleSubmit}
          className="relative flex min-w-0 flex-1 items-center rounded-lg bg-catch-blush px-3 py-2"
        >
          <Search className="pointer-events-none me-2 h-4 w-4 shrink-0 text-catch-muted-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full border-0 bg-transparent p-0 text-xs text-catch-charcoal placeholder:text-catch-muted-soft focus:outline-none focus:ring-0"
          />
        </form>
      </div>
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
