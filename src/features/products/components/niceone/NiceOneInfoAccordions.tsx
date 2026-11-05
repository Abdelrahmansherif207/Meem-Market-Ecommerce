"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ProductDescription } from "../ProductDescription";
import type { ProductDetail } from "../../types";

interface NiceOneInfoAccordionsProps {
  product: ProductDetail;
  locale: string;
}

/**
 * Collapsible info sections from the Stitch PDP screens (native
 * `<details>` accordion, chevron rotate when open).
 *
 * Data honesty: `Description` renders the sanitized backend HTML through
 * the existing `ProductDescription`; `Specifications` shows SKU + the
 * dimensions fields when present; `How to use` / `About the brand` don't
 * exist in the API, so they are simply not rendered.
 */
export function NiceOneInfoAccordions({ product, locale }: NiceOneInfoAccordionsProps) {
  const t = useTranslations("product");
  const tPdp = useTranslations("niceOnePdp");

  const hasDims =
    product.height > 0 || product.width > 0 || product.length > 0 || product.weight > 0;
  const hasSpecs = Boolean(product.sku) || hasDims;

  return (
    <div className="mt-6 border-t border-line">
      <details className="group border-b border-line py-3" open>
        <AccordionSummary>
          {tPdp("description")}
        </AccordionSummary>
        <div className="mt-2 text-xs text-text-secondary">
          <ProductDescription
            description={product.description}
            locale={locale}
            className="text-xs leading-relaxed"
          />
        </div>
      </details>

      {hasSpecs && (
        <details className="group border-b border-line py-3">
          <AccordionSummary>
            {tPdp("specifications")}
          </AccordionSummary>
          <div className="mt-2 space-y-1 text-xs text-text-secondary">
            {Boolean(product.sku) && (
              <p>
                <span className="font-semibold text-text-primary">{t("sku")}:</span> {product.sku}
              </p>
            )}
            {hasDims && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {product.height > 0 && (
                  <span>
                    <span className="font-semibold text-text-primary">{t("height")}:</span>{" "}
                    {product.height} {t("cm")}
                  </span>
                )}
                {product.width > 0 && (
                  <span>
                    <span className="font-semibold text-text-primary">{t("width")}:</span>{" "}
                    {product.width} {t("cm")}
                  </span>
                )}
                {product.length > 0 && (
                  <span>
                    <span className="font-semibold text-text-primary">{t("length")}:</span>{" "}
                    {product.length} {t("cm")}
                  </span>
                )}
                {product.weight > 0 && (
                  <span>
                    <span className="font-semibold text-text-primary">{t("weight")}:</span>{" "}
                    {product.weight} {t("g")}
                  </span>
                )}
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function AccordionSummary({ children }: { children: React.ReactNode }) {
  return (
    <summary
      className={cn(
        "flex cursor-pointer select-none list-none items-center justify-between text-sm font-medium text-text-primary",
        "[&::-webkit-details-marker]:hidden",
      )}
    >
      <span>{children}</span>
      <ChevronDown
        aria-hidden
        className="size-3.5 text-text-muted transition-transform duration-200 group-open:rotate-180"
      />
    </summary>
  );
}
