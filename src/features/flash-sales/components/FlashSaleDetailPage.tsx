import ProductCard from "@/components/ui/ProductCard";
import CountdownTimer from "./CountdownTimer";
import { flashSaleService } from "../services/flashSaleService";
import type { FlashSaleDetail } from "../types";

interface FlashSaleDetailPageProps {
  slug: string;
  locale: string;
}

export default async function FlashSaleDetailPage({ slug, locale }: FlashSaleDetailPageProps) {
  let flashSale: FlashSaleDetail;
  try {
    flashSale = await flashSaleService.getFlashSale(slug, locale);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-secondary text-lg">Flash sale not found</p>
        <a
          href={`/${locale}`}
          className="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Browse Products
        </a>
      </div>
    );
  }

  const isExpired = new Date(flashSale.end_date) <= new Date();

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-secondary text-lg">This flash sale has ended</p>
        <a
          href={`/${locale}`}
          className="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Browse Products
        </a>
      </div>
    );
  }

  const { name, description, image, end_date, products } = flashSale;

  return (
    <div className="w-full flex flex-col gap-6">
      <picture className="relative w-full block overflow-hidden rounded-xl aspect-[21/9]">
        <source media="(min-width: 640px)" srcSet={image.desktop} />
        <img
          src={image.mobile}
          alt={name}
          className="h-full w-full object-cover"
        />
      </picture>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{name}</h1>
          {description && (
            <p className="text-text-secondary text-base mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm font-medium">Ends in:</span>
          <CountdownTimer targetDate={end_date} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-text-secondary text-center">
            No products in this flash sale.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const discountPercent =
              product.flash_sale_active && product.current_price < product.price
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
                flashSaleActive={product.flash_sale_active}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
