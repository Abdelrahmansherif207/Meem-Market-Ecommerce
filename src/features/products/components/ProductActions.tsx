"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
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
      deliveryType: product.is_fast_shipping_available ? "fast" : "scheduled",
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
        <div className="flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
            disabled={selectedQuantity <= 1}
            className={cn(
              "flex size-10 items-center justify-center text-text-primary transition hover:bg-surface",
              selectedQuantity <= 1 && "cursor-not-allowed opacity-40",
            )}
          >
            <Minus className="size-4" />
          </button>
          <span className="flex min-w-[3rem] items-center justify-center text-sm font-semibold text-text-primary">
            {selectedQuantity}
          </span>
          <button
            type="button"
            onClick={() => setSelectedQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={selectedQuantity >= maxQuantity}
            className={cn(
              "flex size-10 items-center justify-center text-text-primary transition hover:bg-surface",
              selectedQuantity >= maxQuantity && "cursor-not-allowed opacity-40",
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-lg font-bold text-text-primary">
          {(price * selectedQuantity).toFixed(2)} {t("currency")}
        </span>
      </div>

      {cartQuantity > 0 ? (
        <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-3 py-2 text-white">
          <button
            type="button"
            onClick={() => decrement()}
            disabled={isPending || cartQuantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cartQuantity === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
          </button>
          <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">
            {cartQuantity}
          </span>
          <button
            type="button"
            onClick={() => increment()}
            disabled={isPending || !stock.inStock || cartQuantity >= maxQuantity}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!stock.inStock || isPending}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold transition",
            stock.inStock && !isPending
              ? "bg-primary text-white hover:bg-primary-dark"
              : "cursor-not-allowed bg-gray-300 text-gray-500",
          )}
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ShoppingCart className="size-5" />
          )}
          {stock.inStock ? t("addToCart") : t("outOfStock")}
        </button>
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
        <p className={stock.inStock ? "text-green-600" : "text-red-500"}>
          {stock.inStock
            ? t("inStock", { count: stock.remaining })
            : t("outOfStock")}
        </p>
      </div>
    </div>
  );
}
