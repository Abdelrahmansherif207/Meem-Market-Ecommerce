"use client";

import { useEffect, useRef, useState } from "react";
import { useDisplayCurrency } from "./useDisplayCurrency";

export interface CurrencyRefetchResult<T> {
  data: T;
  /** True while this island's own background currency refetch is in flight. */
  isRefreshing: boolean;
}

/**
 * Shared currency-driven refetch logic for price islands.
 *
 * Keeps server-rendered `initial` data on first paint (catalog currency).
 * Whenever the *effective* display currency differs from `initialCurrency` —
 * on mount with a stored preference (only while selection is enabled), or
 * after a currency change — it calls `fetchAction` with the code as an
 * explicit argument (the server attaches it as `X-Currency`) and swaps in
 * the converted result. Failures keep the previously rendered prices.
 * `isRefreshing` drives prices-only skeleton UI (see `pricesLoading` on
 * `ProductCard` and friends).
 *
 * With currency selection disabled the effective code is always the
 * backend base currency, so islands already matching the server data skip
 * the refetch entirely.
 *
 * `fetchAction` must be referentially stable for the island's lifetime
 * (wrap params with `useCallback`, or import the action directly).
 */
export function useCurrencyRefetch<T>(
  fetchAction: (currency: string) => Promise<T>,
  initial: T,
  initialCurrency?: string,
): CurrencyRefetchResult<T> {
  const { code: effectiveCode } = useDisplayCurrency();
  const [data, setData] = useState(initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Skip the refetch when the server data already matches the selection.
      if (
        !effectiveCode ||
        (initialCurrency && effectiveCode === initialCurrency)
      ) {
        return;
      }
    }
    let cancelled = false;
    setIsRefreshing(true);
    fetchAction(effectiveCode)
      .then((fresh) => {
        if (!cancelled) setData(fresh);
      })
      .catch(() => {
        // Keep the previously rendered prices on failure.
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchAction, effectiveCode, initialCurrency]);

  return { data, isRefreshing };
}

