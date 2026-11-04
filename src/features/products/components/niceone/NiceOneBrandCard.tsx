"use client";

import { Link } from "@/i18n/navigation";
import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductDetail } from "../../types";

/**
 * Brand authenticity card from the Stitch PDP screens (chip + name +
 * verified check + "100% Authentic products" + black "View all" pill).
 *
 * The API has no `brand` field, so the card anchors on the product's
 * top-level category: the chip shows the category name and "View all"
 * links to that category page. "100% Authentic" is a static trust note
 * (approved design-only content). Hidden when there are no categories.
 */
export function NiceOneBrandCard({ product }: { product: ProductDetail }) {
  const t = useTranslations("niceOnePdp");

  const mainCategory = [...(product.categories ?? [])].sort((a, b) => a.level - b.level)[0];
  if (!mainCategory) return null;

  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3.5 shadow-elev-1">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white p-1 text-center text-[11px] font-extrabold tracking-tight text-text-secondary uppercase">
          <span className="w-full truncate px-0.5">{mainCategory.name}</span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <span className="max-w-36 truncate">{mainCategory.name}</span>
            <BadgeCheck aria-hidden className="size-4 shrink-0 text-success" />
          </div>
          <p className="text-[11px] text-text-muted">{t("authenticProducts")}</p>
        </div>
      </div>
      <Link
        href={`/category/${mainCategory.slug}`}
        className="shrink-0 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-secondary-dark"
      >
        {t("viewAll")}
      </Link>
    </div>
  );
}
