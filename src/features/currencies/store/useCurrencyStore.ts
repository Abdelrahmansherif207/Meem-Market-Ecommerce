"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CURRENCY_STORAGE_KEY } from "@/shared/constants/storageKeys";
import { resolveLocalized, type Currency } from "../types";

interface CurrencyMeta {
  symbol: string;
  decimalPlaces: number;
}

interface CurrencyState {
  /** Currently selected currency code (e.g. "USD"). */
  selectedCode: string;
  /** Currency metadata by code, seeded from the list endpoint. */
  byCode: Record<string, CurrencyMeta>;
  seedFromList: (list: Currency[], baseCode?: string) => void;
  select: (currency: Currency) => void;
}

function metaOf(currency: Currency, locale = "en"): CurrencyMeta {
  return {
    symbol: resolveLocalized(currency.symbol, locale, currency.code),
    decimalPlaces: Number.isFinite(currency.decimal_places)
      ? currency.decimal_places
      : 2,
  };
}

const DEFAULT_CODE = "KWD";

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      selectedCode: DEFAULT_CODE,
      byCode: {},
      seedFromList: (list, baseCode) =>
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
            selectedCode: codes.has(state.selectedCode)
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
