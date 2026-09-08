"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrencyStore } from "../store/useCurrencyStore";

export interface CurrencyRefetchResult<T> {
  data: T;
  /** True while this island's own background currency refetch is in flight. */
  isRefreshing: boolean;
}

/**
 * Shared currency-driven refetch logic for price islands.
 *
 * Keeps server-rendered `initial` data on first paint (catalog currency).
 * Whenever the picker's `selectedCode` differs from `initialCurrency` —
 * on mount with a stored preference, or after a currency change — it calls
 * `fetchAction` with the code as an explicit argument (the server attaches
 * it as `X-Currency`) and swaps in the converted result. Failures keep the
 * previously rendered prices. `isRefreshing` drives prices-only skeleton
 * UI (see `pricesLoading` on `ProductCard` and friends).
 *
 * `fetchAction` must be referentially stable for the island's lifetime
 * (wrap params with `useCallback`, or import the action directly).
 */
export function useCurrencyRefetch<T>(
  fetchAction: (currency: string) => Promise<T>,
  initial: T,
  initialCurrency?: string,
): CurrencyRefetchResult<T> {
  const selectedCode = useCurrencyStore((s) => s.selectedCode);
  const [data, setData] = useState(initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Skip the refetch when the server data already matches the selection.
      if (
        !selectedCode ||
        (initialCurrency && selectedCode === initialCurrency)
      ) {
        return;
      }
    }
    let cancelled = false;
    setIsRefreshing(true);
    fetchAction(selectedCode)
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
  }, [fetchAction, selectedCode, initialCurrency]);

  return { data, isRefreshing };
}
