"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Percent, Tag } from "lucide-react";
import { checkoutService } from "../services/checkoutService";
import type { EligiblePromotion } from "../types";

interface PromotionsPanelProps {
  selectedId: number | null;
  onSelect: (promotion: EligiblePromotion | null) => void;
}

export function PromotionsPanel({ selectedId, onSelect }: PromotionsPanelProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [promotions, setPromotions] = useState<EligiblePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    checkoutService.getEligiblePromotions(locale)
      .then((data) => {
        if (cancelled) return;
        setPromotions(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [locale]);

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {t("promotions")}
          </h3>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (promotions.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {t("promotions")}
          </h3>
        </div>
        <p className="text-sm text-text-secondary">{t("noPromotions")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("promotions")}
        </h3>
      </div>

      <p className="text-xs text-text-secondary">{t("promotionsHint")}</p>

      <div className="space-y-2">
        <label
          className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
            selectedId === null
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            type="radio"
            name="promotion"
            checked={selectedId === null}
            onChange={() => onSelect(null)}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-text-secondary">{t("noPromotion")}</span>
        </label>

        {promotions.map((p) => (
          <label
            key={p.id}
            className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
              selectedId === p.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              name="promotion"
              checked={selectedId === p.id}
              onChange={() => onSelect(p)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {p.type === "fixed_rate" ? (
                  <Tag className="h-4 w-4 text-blue-600 shrink-0" />
                ) : (
                  <Percent className="h-4 w-4 text-green-600 shrink-0" />
                )}
                <span className="text-sm font-medium text-text-primary">{p.title}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {t("saveAmount", { amount: p.discount.toFixed(2) })}
                {p.gift_items.length > 0 && ` + ${p.gift_items.length} gift item(s)`}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
