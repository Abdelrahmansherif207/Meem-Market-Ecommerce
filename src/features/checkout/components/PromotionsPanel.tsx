"use client";
import { useLocale, useTranslations } from "next-intl";
import { Percent, Tag } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { SectionHeader } from "./steps/stepStyles";
import type { EligiblePromotion } from "../types";

interface PromotionsPanelProps {
  /** `null` while loading, `[]` when none available. */
  promotions: EligiblePromotion[] | null;
  error: boolean;
  onRetry: () => void;
  selectedId: number | null;
  onSelect: (promotion: EligiblePromotion | null) => void;
}

export function PromotionsPanel({
  promotions,
  error,
  onRetry,
  selectedId,
  onSelect,
}: PromotionsPanelProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const loading = promotions === null && !error;

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
        <SectionHeader title={t("promotions")} />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
        <SectionHeader title={t("promotions")} />
        <p className="text-sm text-text-secondary">{t("promotionsError")}</p>
        <button type="button" onClick={onRetry} className="text-xs font-semibold text-primary underline underline-offset-2">
          {t("retry")}
        </button>
      </div>
    );
  }

  if (promotions!.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5">
        <SectionHeader title={t("promotions")} />
        <p className="mt-3 text-sm text-text-secondary">{t("noPromotions")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
      <SectionHeader title={t("promotions")} />

      <p className="text-xs text-text-secondary">{t("promotionsHint")}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label
          className={`flex flex-col gap-1.5 rounded-xl border p-3 cursor-pointer transition-colors ${
            selectedId === null
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-secondary">{t("noPromotion")}</span>
            <input
              type="radio"
              name="promotion"
              checked={selectedId === null}
              onChange={() => onSelect(null)}
              className="h-3.5 w-3.5 accent-primary"
            />
          </div>
        </label>

        {promotions!.map((p) => (
          <label
            key={p.id}
            className={`flex flex-col gap-1.5 rounded-xl border p-3 cursor-pointer transition-colors ${
              selectedId === p.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              {p.type === "fixed_rate" ? (
                <Tag className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
              ) : (
                <Percent className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              )}
              <input
                type="radio"
                name="promotion"
                checked={selectedId === p.id}
                onChange={() => onSelect(p)}
                className="h-3.5 w-3.5 shrink-0 accent-primary"
              />
            </div>
            <span className="text-xs font-medium leading-4 text-text-primary line-clamp-2">
              {p.title}
            </span>
            <span className="text-2xs text-success">
              {t("saveAmount", {
                amount: p.discount.toLocaleString(locale === "ar" ? "ar-KW" : "en-KW", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  numberingSystem: locale === "ar" ? "arab" : "latn",
                }),
              })}
              {p.gift_items.length > 0 && ` + ${p.gift_items.length}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
