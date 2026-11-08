"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { setLockedClientCurrency } from "@/shared/lib/currency";
import { useCurrencyStore } from "../store/useCurrencyStore";
import {
  displayCurrencyFromCode,
  displayCurrencyOf,
  resolveBaseCurrency,
  type Currency,
  type CurrencyContextValue,
} from "../types";

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Read the server-resolved currency snapshot. `null` outside the provider
 * (callers must fall back to the store / payload currency themselves).
 */
export function useCurrencySnapshot(): CurrencyContextValue | null {
  return useContext(CurrencyContext);
}

interface CurrencyProviderProps {
  /** Active currencies from `GET /general/currencies` (server-resolved). */
  currencies: Currency[];
  /** Base/catalog currency code from `/general/settings`. */
  baseCode: string;
  /** Settings `currency_selection_enabled` flag. */
  selectionEnabled: boolean;
  children: ReactNode;
}

/**
 * Single source of truth for the display currency.
 *
 * The backend decides the default (settings base code + currencies list);
 * the user's pick is honored only while `currency_selection_enabled` is
 * true — otherwise stale persisted codes are ignored and overwritten.
 * Mounting this in the root layout means every `<Price>` renders the
 * backend currency on first paint, with no client-side guesswork.
 */
export function CurrencyProvider({
  currencies,
  baseCode,
  selectionEnabled,
  children,
}: CurrencyProviderProps) {
  const seedFromList = useCurrencyStore((s) => s.seedFromList);

  // Stable snapshot — server data never changes during a session.
  const value = useMemo<CurrencyContextValue>(() => {
    const fromList = resolveBaseCurrency(currencies, baseCode);
    const defaultCurrency = fromList
      ? displayCurrencyOf(fromList)
      : displayCurrencyFromCode(baseCode);
    return {
      currencies,
      selectionEnabled,
      baseCode: defaultCurrency.code,
      defaultCurrency,
    };
  }, [currencies, baseCode, selectionEnabled]);

  // Transport lock: while selection is disabled guests must never send a
  // stale persisted `X-Currency` header — the backend base currency wins.
  // Idempotent module-level config; runs before any child effects fetch.
  setLockedClientCurrency(selectionEnabled ? undefined : value.baseCode);

  useEffect(() => {
    seedFromList(currencies, value.baseCode, selectionEnabled);
  }, [currencies, value.baseCode, selectionEnabled, seedFromList]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
