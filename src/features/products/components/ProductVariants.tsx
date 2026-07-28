"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { Check } from "lucide-react";
import type { ProductVariant } from "../types";

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelectVariant: (variantId: number) => void;
}

export function ProductVariants({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductVariantsProps) {
  const t = useTranslations("product");

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <p className="text-sm font-semibold text-text-primary">
        {t("options")}
      </p>
      {variants.map((variant) => {
        const isSelected = selectedVariantId === variant.id;
        const inStock = variant.quantity > 0;

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => inStock && onSelectVariant(variant.id)}
            disabled={!inStock}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              !inStock && "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-text-secondary",
              )}
            >
              {isSelected && <Check className="size-3" />}
            </span>

            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-medium text-text-primary">
                {variant.attributes.map((a) => a.value).join(" / ")}
              </p>
              <p className="text-xs text-text-secondary">
                {variant.attributes.map((a => a.attribute_name + ": " + a.value)).join(" | ")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-bold text-text-primary">
                {variant.current_price.toFixed(2)} {t("currency")}
              </span>
              <span
                className={cn(
                  "text-xs",
                  inStock ? "text-green-600" : "text-red-500",
                )}
              >
                {inStock
                  ? t("inStock", { count: variant.quantity })
                  : t("outOfStock")}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
