import ProductCard from "@/components/ui/ProductCard";
import { promotionService } from "../services/promotionService";
import type { PromotionDetail } from "../types";

interface PromotionDetailPageProps {
  slug: string;
  locale: string;
}

export default async function PromotionDetailPage({ slug, locale }: PromotionDetailPageProps) {
  let promotion: PromotionDetail;
  try {
    promotion = await promotionService.getPromotion(slug, locale);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-secondary text-lg">Failed to load promotion</p>
        <a
          href={`/${locale}`}
          className="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Go to homepage
        </a>
      </div>
    );
  }

  const { name, image, products } = promotion;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hero banner */}
      <picture className="relative w-full block overflow-hidden rounded-xl aspect-[16/5]">
        <source media="(min-width: 640px)" srcSet={image.desktop} />
        <img
          src={image.mobile}
          alt={name}
          className="h-full w-full object-cover"
        />
      </picture>

      {/* Promotion title */}
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{name}</h1>

      {/* Products grid */}
      {products.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          No products available for this promotion.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const discountPercent =
              product.discount_active && product.current_price < product.price
                ? Math.round((1 - product.current_price / product.price) * 100)
                : 0;
            return (
              <ProductCard
                key={product.id}
                productId={product.id}
                image={product.image.thumbnail}
                title={product.name}
                price={product.current_price}
                originalPrice={product.price}
                discountPercent={discountPercent}
                slug={product.slug}
                hasVariants={product.has_variants}
                deliveryType={product.is_fast_shipping_available ? "fast" : "scheduled"}
                isInStock={product.in_stock ?? product.quantity > 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
