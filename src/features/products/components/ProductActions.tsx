"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import type { ProductDetail, ProductVariant } from "../types";
import { getStockStatus, getDisplayPrice } from "../utils";

interface ProductActionsProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
  const t = useTranslations("product");
  const variant = selectedVariant;
  const stock = variant
    ? { inStock: product.in_stock && variant.quantity > 0, remaining: variant.quantity }
    : getStockStatus(product);

  const maxQuantity = Math.min(stock.remaining, 99);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const {
    addItem,
    increment,
    decrement,
    quantity: cartQuantity,
    isPending,
  } = useCartActions(product.id);

  const price = variant ? variant.current_price : getDisplayPrice(product);
  const productImage = product.images?.thumbnail ?? '';

  async function handleAddToCart() {
    await addItem({
      quantity: selectedQuantity,
      product_variant_id: variant?.id ?? null,
      name: product.name,
      image: productImage,
      price,
      current_price: price,
      slug: product.slug,
      sku: product.sku,
      in_stock: stock.inStock,
      stock_quantity: stock.remaining,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-text-primary">{t("quantity")}</span>
        <QuantityStepper
          value={selectedQuantity}
          onIncrement={() => setSelectedQuantity((q) => Math.min(maxQuantity, q + 1))}
          onDecrement={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
          incrementDisabled={selectedQuantity >= maxQuantity}
          incrementLabel={t("increaseQuantity")}
          decrementLabel={t("decreaseQuantity")}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-lg font-bold text-text-primary">
          {(price * selectedQuantity).toFixed(2)} {t("currency")}
        </span>
      </div>

      {cartQuantity > 0 ? (
        <QuantityStepper
          value={cartQuantity}
          onIncrement={() => increment()}
          onDecrement={() => decrement()}
          decrementAsRemove
          incrementDisabled={!stock.inStock || cartQuantity >= maxQuantity}
          disabled={isPending}
          variant="pill"
          incrementLabel={t("increaseQuantity")}
          decrementLabel={t("decreaseQuantity")}
          removeLabel={t("removeItem")}
        />
      ) : (
        <Button
          full
          size="lg"
          loading={isPending}
          disabled={!stock.inStock}
          onClick={handleAddToCart}
        >
          {!isPending && <ShoppingCart className="size-5" aria-hidden />}
          {stock.inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      )}

      <WishlistButton
        productId={product.id}
        variantId={selectedVariant?.id ?? null}
        hasVariants={product.variants.length > 0}
        fetchInitial
        variant="full"
      />

      <div className="space-y-1 text-xs text-text-secondary">
        <p>
          {t("sku")}: {product.sku}
        </p>
        <p className={stock.inStock ? "text-success" : "text-error"}>
          {stock.inStock
            ? t("inStock", { count: stock.remaining })
            : t("outOfStock")}
        </p>
      </div>
    </div>
  );
}
