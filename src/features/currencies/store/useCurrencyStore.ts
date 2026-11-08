"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CURRENCY_STORAGE_KEY } from "@/shared/constants/storageKeys";
import { currencySymbolFor } from "@/shared/utils/formatMoney";
import { resolveLocalized, type Currency } from "../types";

interface CurrencyMeta {
  symbol: string;
  decimalPlaces: number;
  /** Display-currency units per 1 base-currency unit (null when unknown). */
  effectiveRate: number | null;
}

interface CurrencyState {
  /** Currently selected currency code — empty until seeded from backend data. */
  selectedCode: string;
  /** Currency metadata by code, seeded from the list endpoint. */
  byCode: Record<string, CurrencyMeta>;
  /**
   * Seed from `GET /general/currencies`. When `selectionEnabled` is false the
   * backend base currency is forced — any stale persisted selection (e.g.
   * `SAR`/`KWD` from a previous store configuration) is ignored/overwritten.
   */
  seedFromList: (
    list: Currency[],
    baseCode?: string,
    selectionEnabled?: boolean,
  ) => void;
  select: (currency: Currency) => void;
}

function metaOf(currency: Currency, locale = "en"): CurrencyMeta {
  const rate = Number(currency.effective_rate);
  return {
    // Prices always show English symbols, even if the API returns Arabic.
    symbol: currencySymbolFor(
      currency.code,
      resolveLocalized(currency.symbol, locale, ""),
    ),
    decimalPlaces: Number.isFinite(currency.decimal_places)
      ? currency.decimal_places
      : 2,
    effectiveRate: Number.isFinite(rate) ? rate : null,
  };
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      selectedCode: "",
      byCode: {},
      seedFromList: (list, baseCode, selectionEnabled = true) =>
        set((state) => {
          if (list.length === 0) return state;
          const byCode: Record<string, CurrencyMeta> = {};
          for (const c of list) {
            if (c?.code) byCode[c.code] = metaOf(c);
          }
          const codes = new Set(list.map((c) => c.code));
          const base =
            (baseCode && codes.has(baseCode) ? baseCode : undefined) ??
            list.find((c) => c.is_base)?.code ??
            list[0].code;
          return {
            byCode,
            // Selection is honored only while the store allows it; otherwise
            // the backend base currency always wins over stale saved codes.
            selectedCode:
              selectionEnabled && codes.has(state.selectedCode)
                ? state.selectedCode
                : base,
          };
        }),
      select: (currency) =>
        set((state) => ({
          selectedCode: currency.code,
          byCode: {
            ...state.byCode,
            [currency.code]: metaOf(currency),
          },
        })),
    }),
    {
      name: CURRENCY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCode: state.selectedCode,
        byCode: state.byCode,
      }),
    },
  ),
);
