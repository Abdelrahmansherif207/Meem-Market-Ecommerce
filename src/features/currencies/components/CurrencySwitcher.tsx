"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { AUTH_TOKEN_STORAGE_KEY } from "@/shared/constants/storageKeys";
import { normalizeCurrencyCode } from "@/shared/lib/currency";
import { currencyService } from "../services/currencyService";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { resolveLocalized, type Currency } from "../types";

interface CurrencySwitcherProps {
  className?: string;
}

export function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const locale = useLocale();
  const t = useTranslations("header.common");
  const selectedCode = useCurrencyStore((s) => s.selectedCode);
  const seedFromList = useCurrencyStore((s) => s.seedFromList);
  const select = useCurrencyStore((s) => s.select);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [open, setOpen] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(rootRef, useCallback(() => setOpen(false), []), open);

  useEffect(() => {
    let cancelled = false;
    currencyService
      .getCurrencies(locale)
      .then((list) => {
        if (cancelled) return;
        setCurrencies(list);
        seedFromList(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, seedFromList]);

  if (failed || currencies.length === 0) return null;

  const selected =
    currencies.find((c) => c.code === selectedCode) ?? currencies[0];

  const handleSelect = async (currency: Currency) => {
    const code = normalizeCurrencyCode(currency.code);
    // Only offer codes the backend lists as available; ignore anything else.
    if (!code || code === selectedCode || pendingCode) return;
    if (!currencies.some((c) => c.code === code)) return;
    setPendingCode(code);
    // Authenticated users persist the preference server-side
    // (`user_preferences`); guests just start sending `X-Currency: <code>`
    // via the central client — no backend call needed.
    const isAuthenticated =
      typeof window !== "undefined" &&
      !!window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (isAuthenticated) {
      try {
        await currencyService.selectCurrency(code, locale);
      } catch {
        // Keep the previous selection if the backend rejects the change.
        setPendingCode(null);
        return;
      }
    }
    // Store update re-fires subscribed price islands, which refetch with
    // the new value as an explicit Server Action argument. No reload.
    select({ ...currency, code });
    setPendingCode(null);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("currency")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-black/10 bg-transparent px-3 text-sm font-semibold shadow-sm transition-opacity duration-200 hover:opacity-80 active:opacity-60"
      >
        <span dir="ltr">{selected.code}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("currency")}
          className="absolute end-0 top-full z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-elev-1"
        >
          {currencies.map((currency) => {
            const isActive = currency.code === selectedCode;
            const isPending = pendingCode === currency.code;
            return (
              <li key={currency.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelect(currency)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-surface",
                    isActive ? "font-bold text-primary" : "text-text-primary",
                    isPending && "cursor-wait opacity-60",
                  )}
                >
                  <span className="font-semibold" dir="ltr">
                    {currency.code}
                  </span>
                  <span className="flex-1 truncate text-xs text-text-secondary">
                    {resolveLocalized(currency.name, locale, currency.code)}
                  </span>
                  <span className="text-xs text-text-muted" dir="ltr">
                    {resolveLocalized(currency.symbol, locale, "")}
                  </span>
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    isActive && (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
