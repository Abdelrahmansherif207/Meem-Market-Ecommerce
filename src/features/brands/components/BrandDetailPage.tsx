import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { brandService } from "../services/brandService";

interface BrandDetailPageProps {
  slug: string;
  locale: string;
}

export default async function BrandDetailPage({ slug, locale }: BrandDetailPageProps) {
  let brand;
  try {
    brand = await brandService.getBrand(slug, locale);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-text-secondary">Failed to load brand</p>
        <a
          href={`/${locale}/brands`}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Back to Brands
        </a>
      </div>
    );
  }

  const { name, image, products } = brand;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Brand hero */}
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-surface md:h-40 md:w-40">
          <img
            src={image.desktop || image.mobile}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{name}</h1>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-text-secondary">No products from this brand yet.</p>
          <Link
            href="/"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => {
            const discountPercent =
              product.price_after_discount > 0 && product.price_after_discount < product.price
                ? Math.round((1 - product.price_after_discount / product.price) * 100)
                : 0;
            return (
              <ProductCard
                key={product.id}
                productId={product.id}
                image={product.image.thumbnail}
                title={product.name}
                price={product.price_after_discount > 0 ? product.price_after_discount : product.price}
                originalPrice={product.price}
                discountPercent={discountPercent}
                slug={product.slug}
                isInStock
                tags={product.tags}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
