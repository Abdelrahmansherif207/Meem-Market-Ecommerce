"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ProductDeliveryInfo } from "./ProductDeliveryInfo";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductVariants } from "./ProductVariants";
import { ProductActions } from "./ProductActions";
import { ProductReviews } from "./ProductReviews";
import type { ProductDetail } from "../types";
import { getSortedImages } from "../utils";

interface ProductPageContentProps {
  product: ProductDetail;
}

export function ProductPageContent({ product }: ProductPageContentProps) {
  const t = useTranslations("product");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    () => product.variants.find((v) => v.quantity > 0)?.id ?? product.variants[0]?.id ?? null,
  );
  const images = getSortedImages(product);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_minmax(300px,1fr)] lg:gap-8">
      <aside className="space-y-6 order-last lg:order-1">
        <ProductDeliveryInfo />
        <ProductActions product={product} selectedVariant={selectedVariant} />
      </aside>

      <main className="space-y-8 border-x border-border/40 px-0 lg:px-6 lg:order-2">
        <ProductInfo product={product} selectedVariant={selectedVariant} />
        <ProductVariants
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />

        <section>
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            {t("description")}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {product.description}
          </p>
        </section>

        {(product.height > 0 || product.width > 0 || product.length > 0 || product.weight > 0) && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-text-primary">
              {t("additionalInfo")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.height > 0 && (
                <InfoCard label={t("height")} value={`${product.height} ${t("cm")}`} />
              )}
              {product.width > 0 && (
                <InfoCard label={t("width")} value={`${product.width} ${t("cm")}`} />
              )}
              {product.length > 0 && (
                <InfoCard label={t("length")} value={`${product.length} ${t("cm")}`} />
              )}
              {product.weight > 0 && (
                <InfoCard label={t("weight")} value={`${product.weight} ${t("g")}`} />
              )}
            </div>
          </section>
        )}

        {product.reviews.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-text-primary">
              {t("reviewsTitle")}
            </h2>
            <ProductReviews reviews={product.reviews} />
          </section>
        )}
      </main>

      <aside className="w-full order-first lg:order-3">
        <ProductGallery
          images={images}
          thumbnail={product.images.thumbnail}
          productName={product.name}
          compact
        />
      </aside>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
