"use client";

import { useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { SearchAutocompleteDropdown } from "../header/SearchAutocompleteDropdown";
import { useSearchAutocomplete } from "../../hooks/useSearchAutocomplete";

interface CatchSearchBarProps {
  placeholder: string;
  compact?: boolean;
}

/**
 * Screen-styled search field (start-aligned icon, square corners). Reuses
 * the existing autocomplete hook + dropdown so search behavior, API calls
 * and routing stay untouched.
 *
 * `compact` renders the shorter rounded variant used by the sticky header.
 */
export default function CatchSearchBar({
  placeholder,
  compact = false,
}: CatchSearchBarProps) {
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
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search
          className={cn(
            "pointer-events-none absolute h-4 w-4 text-catch-muted-soft",
            compact ? "start-3" : "start-4",
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(
            "w-full border-none bg-catch-blush text-xs text-catch-charcoal shadow-none placeholder:text-catch-muted-soft focus:bg-white focus:outline-none focus:ring-0",
            compact
              ? "h-10 rounded-lg ps-9 pe-3"
              : "h-11 rounded-none ps-11 pe-4",
          )}
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
