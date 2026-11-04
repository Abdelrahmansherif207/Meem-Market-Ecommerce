"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import "../../styles/pdp.css";

import { NiceOneGallery } from "./NiceOneGallery";
import { NiceOneHeroInfo } from "./NiceOneHeroInfo";
import { NiceOneInstallmentsWidget } from "./NiceOneInstallmentsWidget";
import { NiceOneVariantSelector } from "./NiceOneVariantSelector";
import { NiceOneBuyBox } from "./NiceOneBuyBox";
import { NiceOneInfoAccordions } from "./NiceOneInfoAccordions";
import { NiceOneBrandCard } from "./NiceOneBrandCard";
import { NiceOneBundleSection } from "./NiceOneBundleSection";
import { NiceOneRecommendedRail } from "./NiceOneRecommendedRail";
import { NiceOneReviewsSection } from "./NiceOneReviewsSection";
import { NiceOneStickyBar } from "./NiceOneStickyBar";
import type { ProductDetail } from "../../types";
import { getSortedImages } from "../../utils";

interface NiceOneProductPageContentProps {
  product: ProductDetail;
  /** True while the currency island refetches — price fields skeleton. */
  pricesLoading?: boolean;
}

/**
 * Nice One-style product details page (Stitch screens
 * "Nice One - Desktop/Mobile Product Details Page", project
 * 15869096413823851060). One responsive composition covering both
 * breakpoints.
 *
 * This replaces the old `ProductPageContent` layout shell only — the data
 * flow, hooks and services it composes (`useCartActions`,
 * `useDisplayCurrency`, `ReviewForm`, wishlist/cart stores) are untouched.
 */
export function NiceOneProductPageContent({
  product,
  pricesLoading = false,
}: NiceOneProductPageContentProps) {
  const router = useRouter();
  const locale = useLocale();

  // Same initial-selection rule as the previous layout shell.
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    () => product.variants.find((v) => v.quantity > 0)?.id ?? product.variants[0]?.id ?? null,
  );
  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const handleReviewSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  const images = getSortedImages(product);
  const related = product.related_products ?? [];

  const mainCategory = [...(product.categories ?? [])].sort((a, b) => a.level - b.level)[0];
  const seeMoreHref = mainCategory ? `/category/${mainCategory.slug}` : null;

  return (
    <div className="pdp-scope mx-auto w-full max-w-[1440px] pb-28 lg:pb-10">
      {/* ── Hero card: gallery + buy panel ─────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 rounded-xl bg-white p-4 shadow-elev-1 lg:grid-cols-12 lg:gap-10 lg:p-8">
        <div className="lg:col-span-7">
          <NiceOneGallery
            images={images}
            thumbnail={product.images?.thumbnail ?? ""}
            productName={product.name}
          />
        </div>

        <div className="flex flex-col lg:col-span-5">
          <NiceOneHeroInfo
            product={product}
            selectedVariant={selectedVariant}
            pricesLoading={pricesLoading}
          />

          <div className="order-2 mt-4">
            <NiceOneInstallmentsWidget />
          </div>

          {(product.variants.length > 0) && (
            <div className="order-3 mt-4">
              <NiceOneVariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelectVariant={setSelectedVariantId}
                currency={product.currency}
                pricesLoading={pricesLoading}
              />
            </div>
          )}

          {/* Desktop add-to-bag; mobile uses the fixed bottom bar */}
          <div className="order-4 mt-5 hidden lg:block">
            <NiceOneBuyBox
              product={product}
              selectedVariant={selectedVariant}
              pricesLoading={pricesLoading}
            />
          </div>

          <div className="order-5 mt-6">
            <NiceOneInfoAccordions product={product} locale={locale} />
          </div>

          {/* Mobile design order: brand card right after the variants block;
              desktop: after the accordions, directly above the bundle band */}
          <div className="order-4 lg:order-6">
            <NiceOneBrandCard product={product} />
          </div>

          <div className="order-6 lg:order-7">
            <NiceOneBundleSection
              items={related.slice(0, 8)}
              pricesLoading={pricesLoading}
            />
          </div>
        </div>
      </section>

      {/* ── Recommended products ───────────────────────────────────────── */}
      <NiceOneRecommendedRail
        items={related}
        pricesLoading={pricesLoading}
        seeMoreHref={seeMoreHref}
      />

      {/* ── Customer reviews ───────────────────────────────────────────── */}
      <section className="mt-10 rounded-xl bg-white p-4 shadow-elev-1 lg:p-8">
        <NiceOneReviewsSection
          productId={product.id}
          reviews={product.reviews}
          onReviewSuccess={handleReviewSuccess}
        />
      </section>

      {/* ── Mobile fixed add-to-bag bar ────────────────────────────────── */}
      <NiceOneStickyBar
        product={product}
        selectedVariant={selectedVariant}
        pricesLoading={pricesLoading}
      />
    </div>
  );
}
