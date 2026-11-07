"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import Skeleton from "@/components/ui/Skeleton";
import type { ProductVariant } from "../../types";
import type { ProductCurrency } from "@/features/currencies";

interface NiceOneVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelectVariant: (variantId: number) => void;
  currency?: ProductCurrency;
  /** When true, variant price numbers render as skeleton bars. */
  pricesLoading?: boolean;
}

/**
 * Nice One-style variant chips (Stitch screens don't show variant UI, but
 * the cart/wishlist logic requires an explicit selection for variant
 * products, so we render chips in the same design language: bordered
 * rounded boxes that turn ink-black-bordered when selected).
 * Same as the existing `ProductVariants` component: selection is a plain
 * state change, out-of-stock variants stay disabled.
 */
export function NiceOneVariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  currency,
  pricesLoading = false,
}: NiceOneVariantSelectorProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { symbol: currencySymbol, decimalPlaces } = useDisplayCurrency(currency);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-text-secondary">{t("options")}</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const inStock = variant.quantity > 0;
          const fullLabel = variant.attributes
            .map((a) => `${a.attribute_name}: ${a.value}`)
            .join(" · ");

          return (
            <button
              key={variant.id}
              type="button"
              title={fullLabel}
              onClick={() => inStock && onSelectVariant(variant.id)}
              disabled={!inStock}
              aria-pressed={isSelected}
              className={cn(
                "flex min-w-28 flex-col items-start gap-0.5 rounded-lg border-2 px-3 py-2 text-start transition",
                isSelected ? "border-ink bg-white" : "border-line hover:border-neutral/60",
                !inStock && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="max-w-48 truncate text-xs font-semibold text-text-primary">
                {variant.attributes.map((a) => a.value).join(" / ")}
              </span>
              {pricesLoading ? (
                <Skeleton className="h-3 w-14" />
              ) : (
                <span className="text-[11px] font-bold text-text-primary">
                  {formatNumber(variant.current_price, locale, decimalPlaces)} {currencySymbol}
                </span>
              )}
              <span className={cn("text-[10px]", inStock ? "text-success" : "text-error")}>
                {inStock ? t("inStock", { count: variant.quantity }) : t("outOfStock")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
